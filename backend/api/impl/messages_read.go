package impl

import (
	"context"
	"fmt"

	gen "backend/api/gen"
	"backend/db"
	"backend/middleware" // ← contextから userID 取得
)
func (h *HandlerImpl) MarkMessageAsRead(ctx context.Context, params gen.MarkMessageAsReadParams) (gen.MarkMessageAsReadRes, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, fmt.Errorf("unauthorized")
	}

	if err := db.MarkMessageAsRead(db.DB, uint(params.MessageID), uint(userID)); err != nil {
		return nil, fmt.Errorf("failed to mark as read: %w", err)
	}

	return &gen.MarkMessageAsReadNoContent{}, nil
}

