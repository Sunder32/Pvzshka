package handlers

import (
	"encoding/json"
	"net/http"

	"logistics-service/internal/adapters"
)

type PVZHandler struct {
	cdekAdapter     *adapters.CDEKAdapter
	boxberryAdapter *adapters.BoxberryAdapter
}

func NewPVZHandler(cdek *adapters.CDEKAdapter, boxberry *adapters.BoxberryAdapter) *PVZHandler {
	return &PVZHandler{
		cdekAdapter:     cdek,
		boxberryAdapter: boxberry,
	}
}

type PVZListRequest struct {
	City     string `json:"city"`
	Provider string `json:"provider"` // cdek, boxberry, pickpoint
}

type PVZListResponse struct {
	Provider string                   `json:"provider"`
	Points   []map[string]interface{} `json:"points"`
}

func (h *PVZHandler) ListPVZ(w http.ResponseWriter, r *http.Request) {
	city := r.URL.Query().Get("city")
	provider := r.URL.Query().Get("provider")

	if city == "" {
		respondError(w, http.StatusBadRequest, "city parameter is required")
		return
	}

	var points []map[string]interface{}
	var err error

	switch provider {
	case "cdek":
		points, err = h.cdekAdapter.GetPVZList(r.Context(), city)
	case "boxberry":
		points, err = h.boxberryAdapter.GetPVZList(r.Context(), city)
	default:
		// Get from all providers
		cdekPoints, _ := h.cdekAdapter.GetPVZList(r.Context(), city)
		boxberryPoints, _ := h.boxberryAdapter.GetPVZList(r.Context(), city)

		points = append(points, cdekPoints...)
		points = append(points, boxberryPoints...)
	}

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, PVZListResponse{
		Provider: provider,
		Points:   points,
	})
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}
