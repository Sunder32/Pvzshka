package handlers

import (
	"encoding/json"
	"net/http"

	"logistics-service/internal/adapters"
)

type ShipmentHandler struct {
	cdekAdapter     *adapters.CDEKAdapter
	boxberryAdapter *adapters.BoxberryAdapter
}

func NewShipmentHandler(cdek *adapters.CDEKAdapter, boxberry *adapters.BoxberryAdapter) *ShipmentHandler {
	return &ShipmentHandler{
		cdekAdapter:     cdek,
		boxberryAdapter: boxberry,
	}
}

type CalculateShippingRequest struct {
	Provider   string  `json:"provider"`
	FromCity   string  `json:"from_city"`
	ToCity     string  `json:"to_city"`
	Weight     float64 `json:"weight"`
	Dimensions struct {
		Length int `json:"length"`
		Width  int `json:"width"`
		Height int `json:"height"`
	} `json:"dimensions"`
}

type CalculateShippingResponse struct {
	Provider     string  `json:"provider"`
	Cost         float64 `json:"cost"`
	Currency     string  `json:"currency"`
	DeliveryDays int     `json:"delivery_days"`
}

type CreateShipmentRequest struct {
	Provider      string `json:"provider"`
	OrderNumber   string `json:"order_number"`
	RecipientName string `json:"recipient_name"`
	RecipientPhone string `json:"recipient_phone"`
	RecipientEmail string `json:"recipient_email"`
	PVZCode       string `json:"pvz_code"`
	Weight        float64 `json:"weight"`
	Price         float64 `json:"price"`
}

type CreateShipmentResponse struct {
	TrackingNumber string `json:"tracking_number"`
	Provider       string `json:"provider"`
	Label          string `json:"label,omitempty"`
}

func (h *ShipmentHandler) CalculateShipping(w http.ResponseWriter, r *http.Request) {
	var req CalculateShippingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var cost float64
	var currency string
	var deliveryDays int
	var err error

	switch req.Provider {
	case "cdek":
		cdekReq := &adapters.CDEKCalculateRequest{
			TariffCode: 136, // To PVZ
			FromLocation: adapters.CDEKLocation{
				City: req.FromCity,
			},
			ToLocation: adapters.CDEKLocation{
				City: req.ToCity,
			},
			Packages: []adapters.CDEKPackage{
				{
					Weight: int(req.Weight * 1000), // Convert to grams
					Length: req.Dimensions.Length,
					Width:  req.Dimensions.Width,
					Height: req.Dimensions.Height,
				},
			},
		}

		result, err := h.cdekAdapter.CalculateShipping(r.Context(), cdekReq)
		if err != nil {
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}

		cost = result.TotalSum
		currency = result.Currency
		deliveryDays = result.PeriodMax

	case "boxberry":
		boxberryReq := &adapters.BoxberryCalculateRequest{
			TargetCity: req.ToCity,
			Weight:     req.Weight,
			Sum:        0,
		}

		result, err := h.boxberryAdapter.CalculateShipping(r.Context(), boxberryReq)
		if err != nil {
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}

		cost = result.Price
		currency = "RUB"
		deliveryDays = result.DeliveryDays

	default:
		respondError(w, http.StatusBadRequest, "Invalid provider")
		return
	}

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, CalculateShippingResponse{
		Provider:     req.Provider,
		Cost:         cost,
		Currency:     currency,
		DeliveryDays: deliveryDays,
	})
}

func (h *ShipmentHandler) CreateShipment(w http.ResponseWriter, r *http.Request) {
	var req CreateShipmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var trackingNumber string
	var label string
	var err error

	switch req.Provider {
	case "cdek":
		cdekReq := &adapters.CDEKCreateOrderRequest{
			Type:       1,
			Number:     req.OrderNumber,
			TariffCode: 136,
			Recipient: adapters.CDEKContact{
				Name: req.RecipientName,
				Phones: []adapters.CDEKPhone{
					{Number: req.RecipientPhone},
				},
			},
			DeliveryPoint: req.PVZCode,
		}

		result, err := h.cdekAdapter.CreateOrder(r.Context(), cdekReq)
		if err != nil {
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}

		trackingNumber = result.Entity.UUID

	case "boxberry":
		boxberryReq := &adapters.BoxberryCreateOrderRequest{
			OrderID: req.OrderNumber,
			Weight:  req.Weight,
			Price:   req.Price,
			Recipient: adapters.BoxberryRecipient{
				Name:  req.RecipientName,
				Phone: req.RecipientPhone,
				Email: req.RecipientEmail,
			},
			PVZCode: req.PVZCode,
		}

		result, err := h.boxberryAdapter.CreateOrder(r.Context(), boxberryReq)
		if err != nil {
			respondError(w, http.StatusInternalServerError, err.Error())
			return
		}

		trackingNumber = result.TrackNumber
		label = result.Label

	default:
		respondError(w, http.StatusBadRequest, "Invalid provider")
		return
	}

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, CreateShipmentResponse{
		TrackingNumber: trackingNumber,
		Provider:       req.Provider,
		Label:          label,
	})
}

func (h *ShipmentHandler) GetShipmentStatus(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	trackingNumber := r.URL.Query().Get("tracking_number")

	if trackingNumber == "" {
		respondError(w, http.StatusBadRequest, "tracking_number is required")
		return
	}

	var status string
	var err error

	switch provider {
	case "cdek":
		status, err = h.cdekAdapter.GetOrderStatus(r.Context(), trackingNumber)
	default:
		status = "unknown"
	}

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"tracking_number": trackingNumber,
		"provider":        provider,
		"status":          status,
	})
}
