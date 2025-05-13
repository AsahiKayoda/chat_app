package impl

import (
	"context"

	"backend/db"
	gen "backend/api/gen"
)

//type HandlerImpl struct{}

// POST /messages - メッセージ送信
func (h *HandlerImpl) MessagesPost(ctx context.Context, req *gen.MessageInput) (*gen.Message, error) {
	senderID := 1 // 今は仮のログインユーザーID（将来はJWTから取得）

	msg := db.MessageModel{
		SenderID:   uint(senderID),
		ReceiverID: uint(req.ReceiverID),
		Text:       req.Text,
	}

	if result := db.DB.Create(&msg); result.Error != nil {
		return nil, result.Error
	}

	return &gen.Message{
		ID:         int(msg.ID),
		SenderID:   int(msg.SenderID),
		ReceiverID: int(msg.ReceiverID),
		Text:       msg.Text,
		Timestamp:  msg.Timestamp,
	}, nil
}

// GET /messages?receiver_id=X - メッセージ取得（相手とのやり取り）
func (h *HandlerImpl) MessagesGet(ctx context.Context, params gen.MessagesGetParams) ([]gen.Message, error) {
	senderID := 1 // 今は仮のログインユーザーID（将来はJWTから取得）

	var messages []db.MessageModel
	if result := db.DB.
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			senderID, params.ReceiverID, params.ReceiverID, senderID).
		Order("timestamp asc").
		Find(&messages); result.Error != nil {
		return nil, result.Error
	}

	var resp []gen.Message
	for _, m := range messages {
		resp = append(resp, gen.Message{
			ID:         int(m.ID),
			SenderID:   int(m.SenderID),
			ReceiverID: int(m.ReceiverID),
			Text:       m.Text,
			Timestamp:  m.Timestamp,
		})
	}

	return resp, nil
}
