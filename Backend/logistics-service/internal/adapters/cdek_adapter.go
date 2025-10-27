package adapters

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type CDEKAdapter struct {
	BaseURL    string
	ClientID   string
	ClientSecret string
	httpClient *http.Client
	token      string
	tokenExp   time.Time
}

func NewCDEKAdapter(baseURL, clientID, clientSecret string) *CDEKAdapter {
	return &CDEKAdapter{
		BaseURL:      baseURL,
		ClientID:     clientID,
		ClientSecret: clientSecret,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type CDEKCalculateRequest struct {
	TariffCode int     `json:"tariff_code"`
	FromLocation CDEKLocation `json:"from_location"`
	ToLocation   CDEKLocation `json:"to_location"`
	Packages []CDEKPackage `json:"packages"`
}

type CDEKLocation struct {
	Code       string `json:"code,omitempty"`
	PostalCode string `json:"postal_code,omitempty"`
	City       string `json:"city,omitempty"`
}

type CDEKPackage struct {
	Weight int `json:"weight"` // in grams
	Length int `json:"length"` // in cm
	Width  int `json:"width"`
	Height int `json:"height"`
}

type CDEKCalculateResponse struct {
	TotalSum     float64 `json:"total_sum"`
	Currency     string  `json:"currency"`
	DeliverySum  float64 `json:"delivery_sum"`
	PeriodMin    int     `json:"period_min"`
	PeriodMax    int     `json:"period_max"`
}

type CDEKCreateOrderRequest struct {
	Type         int            `json:"type"` // 1 - online store
	Number       string         `json:"number"`
	TariffCode   int            `json:"tariff_code"`
	Sender       CDEKContact    `json:"sender"`
	Recipient    CDEKContact    `json:"recipient"`
	FromLocation CDEKLocation   `json:"from_location"`
	ToLocation   CDEKLocation   `json:"to_location"`
	Packages     []CDEKPackage  `json:"packages"`
	DeliveryPoint string        `json:"delivery_point,omitempty"`
}

type CDEKContact struct {
	Company  string          `json:"company,omitempty"`
	Name     string          `json:"name"`
	Email    string          `json:"email,omitempty"`
	Phones   []CDEKPhone     `json:"phones"`
}

type CDEKPhone struct {
	Number string `json:"number"`
}

type CDEKOrderResponse struct {
	Entity struct {
		UUID   string `json:"uuid"`
		Number string `json:"number"`
	} `json:"entity"`
}

func (a *CDEKAdapter) authenticate(ctx context.Context) error {
	if time.Now().Before(a.tokenExp) {
		return nil
	}

	data := map[string]string{
		"grant_type":    "client_credentials",
		"client_id":     a.ClientID,
		"client_secret": a.ClientSecret,
	}

	jsonData, _ := json.Marshal(data)
	req, err := http.NewRequestWithContext(ctx, "POST", a.BaseURL+"/v2/oauth/token", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	a.token = result.AccessToken
	a.tokenExp = time.Now().Add(time.Duration(result.ExpiresIn) * time.Second)

	return nil
}

func (a *CDEKAdapter) CalculateShipping(ctx context.Context, req *CDEKCalculateRequest) (*CDEKCalculateResponse, error) {
	if err := a.authenticate(ctx); err != nil {
		return nil, err
	}

	jsonData, _ := json.Marshal(req)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", a.BaseURL+"/v2/calculator/tariff", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+a.token)

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("CDEK API error: %s", string(body))
	}

	var result CDEKCalculateResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (a *CDEKAdapter) CreateOrder(ctx context.Context, req *CDEKCreateOrderRequest) (*CDEKOrderResponse, error) {
	if err := a.authenticate(ctx); err != nil {
		return nil, err
	}

	jsonData, _ := json.Marshal(req)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", a.BaseURL+"/v2/orders", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+a.token)

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("CDEK API error: %s", string(body))
	}

	var result CDEKOrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (a *CDEKAdapter) GetOrderStatus(ctx context.Context, uuid string) (string, error) {
	if err := a.authenticate(ctx); err != nil {
		return "", err
	}

	httpReq, err := http.NewRequestWithContext(ctx, "GET", a.BaseURL+"/v2/orders/"+uuid, nil)
	if err != nil {
		return "", err
	}

	httpReq.Header.Set("Authorization", "Bearer "+a.token)

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Entity struct {
			Statuses []struct {
				Code string `json:"code"`
				Name string `json:"name"`
			} `json:"statuses"`
		} `json:"entity"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Entity.Statuses) > 0 {
		return result.Entity.Statuses[0].Name, nil
	}

	return "unknown", nil
}

func (a *CDEKAdapter) GetPVZList(ctx context.Context, city string) ([]map[string]interface{}, error) {
	if err := a.authenticate(ctx); err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/v2/deliverypoints?city=%s&type=PVZ", a.BaseURL, city)
	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Authorization", "Bearer "+a.token)

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}
