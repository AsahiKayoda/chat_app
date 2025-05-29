package impl

import (
	"context"
	"errors"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware"

	"gorm.io/gorm"
)

func (h *HandlerImpl) MentionsGet(ctx context.Context) (gen.MentionsGetRes, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return &gen.MentionsGetUnauthorized{}, nil
	}

	var messages []db.MessageModel
	err := db.DB.
		Table("messages AS m").
		Joins("JOIN mentions me ON me.message_id = m.id").
		Where("me.mention_target_id = ? AND NOT EXISTS ("+
			"SELECT 1 FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id = me.mention_target_id"+
			")", userID).
		Find(&messages).Error


	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			empty := gen.MentionedMessages{}
			return &empty, nil
		}
		return &gen.MentionsGetInternalServerError{}, nil
	}

	var result gen.MentionedMessages
	for _, m := range messages {
		result = append(result, gen.MentionedMessage{
			MessageID: gen.NewOptInt(int(m.ID)),
			Content:   gen.NewOptString(m.Content),
			RoomID:    gen.NewOptInt(m.RoomID),
			SenderID:  gen.NewOptInt(m.SenderID),
			CreatedAt: gen.NewOptDateTime(m.CreatedAt),
		})
	}

	return &result, nil
}

