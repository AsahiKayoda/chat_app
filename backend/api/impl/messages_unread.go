package impl

import (
	"context"
	"fmt"

	gen "backend/api/gen"
	"backend/db"
	"backend/middleware" // ← contextから userID 取得
)

func (h *HandlerImpl) GetUnreadMessages(ctx context.Context) ([]gen.Message, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, fmt.Errorf("unauthorized")
	}

	models, err := db.GetUnreadMessages(db.DB, uint(userID))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch unread messages: %w", err)
	}

	var res []gen.Message
	for _, m := range models {
		res = append(res, gen.Message{
			ID:        int(m.ID),
			SenderID:  int(m.SenderID),
			RoomID:    int(m.RoomID),
			Text:      m.Content,
			Timestamp: m.CreatedAt,
			IsRead:    gen.OptBool{Set: true, Value: false}, // 明示的に未読
		})
	}

	return res, nil
}
