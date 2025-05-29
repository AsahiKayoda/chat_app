package impl

import (
	"context"
	"errors"
	"fmt"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware"

	"gorm.io/gorm"
)

func (h *HandlerImpl) DeleteMessage(ctx context.Context, params gen.DeleteMessageParams) (gen.DeleteMessageRes, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, fmt.Errorf("unauthorized")
	}

	var message db.MessageModel
	if err := db.DB.First(&message, params.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("message not found")
		}
		return nil, fmt.Errorf("internal server error: %w", err)
	}

	if message.SenderID != userID {
		return nil, fmt.Errorf("forbidden: not the sender")
	}

	if err := db.DB.Delete(&message).Error; err != nil {
		return nil, fmt.Errorf("failed to delete: %w", err)
	}

	// 204 No Content に相当する struct を返す（たいてい `gen.DeleteMessageNoContent{}` みたいなの）
	return &gen.DeleteMessageNoContent{}, nil
}
