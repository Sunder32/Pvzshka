package adapters

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type BoxberryAdapter struct {
	BaseURL    string
	APIToken   string
	httpClient *http.Client
}

func NewBoxberryAdapter(baseURL, apiToken string) *BoxberryAdapter {
	return &BoxberryAdapter{
		BaseURL:  baseURL,
		APIToken: apiToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type BoxberryCalculateRequest struct {
	TargetCity string
	Weight     float64
	Sum        float64
}

type BoxberryCalculateResponse struct {
	Price        float64 `json:"price"`
	DeliveryDays int     `json:"delivery_period"`
}

type BoxberryCreateOrderRequest struct {
	OrderID   string
	Price     float64
	Weight    float64
	Recipient BoxberryRecipient
	PVZCode   string
}

type BoxberryRecipient struct {
	Name  string
	Phone string
	Email string
}

type BoxberryOrderResponse struct {
	TrackNumber string `json:"track"`
	Label       string `json:"label"`
}

func (a *BoxberryAdapter) CalculateShipping(ctx context.Context, req *BoxberryCalculateRequest) (*BoxberryCalculateResponse, error) {
	params := url.Values{}
	params.Add("token", a.APIToken)
	params.Add("method", "DeliveryCosts")
	params.Add("target", req.TargetCity)
	params.Add("weight", fmt.Sprintf("%.0f", req.Weight))
	params.Add("sum", fmt.Sprintf("%.2f", req.Sum))

	apiURL := fmt.Sprintf("%s/api.php?%s", a.BaseURL, params.Encode())

	httpReq, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Boxberry API error: %s", string(body))
	}

	var result BoxberryCalculateResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (a *BoxberryAdapter) CreateOrder(ctx context.Context, req *BoxberryCreateOrderRequest) (*BoxberryOrderResponse, error) {
	data := map[string]interface{}{
		"token":      a.APIToken,
		"method":     "ParselCreate",
		"order_id":   req.OrderID,
		"price":      req.Price,
		"weight":     req.Weight,
		"vid":        "1", // delivery to PVZ
		"point":      req.PVZCode,
		"name":       req.Recipient.Name,
		"phone":      req.Recipient.Phone,
		"email":      req.Recipient.Email,
	}

	jsonData, _ := json.Marshal(data)
	apiURL := fmt.Sprintf("%s/api.php", a.BaseURL)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", apiURL, nil)
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Body = io.NopCloser(bytes.NewBuffer(jsonData))

	resp, err := a.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Boxberry API error: %s", string(body))
	}

	var result BoxberryOrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (a *BoxberryAdapter) GetPVZList(ctx context.Context, city string) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Add("token", a.APIToken)
	params.Add("method", "ListPoints")
	params.Add("city", city)

	apiURL := fmt.Sprintf("%s/api.php?%s", a.BaseURL, params.Encode())

	httpReq, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		return nil, err
	}

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
