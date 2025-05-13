package impl

import (
	"context"

	"backend/db"
	gen "backend/api/gen"
)

//type HandlerImpl struct{}

// POST /messages - メッセージ送信
func (h *HandlerImpl) MessagesPost(ctx context.Context, req *gen.MessageInput) (*gen.Message, error) {
	senderID := 1 // 仮のログインユーザー（後でJWTから取得する予定）

	msg := db.MessageModel{
		SenderID:   uint(senderID),
		ReceiverID: uint(req.ReceiverID),
		Text:       req.Text,
	}

	if result := db.DB.Create(&msg); result.Error != nil {
		return nil, result.Error
	}

	// 作成したメッセージを返す
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
	senderID := 1 // JWTのトーク保有者のIDが代入される

	var messages []db.MessageModel
	if result := db.DB.
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			senderID, params.ReceiverID, params.ReceiverID, senderID).
		Order("timestamp asc").// 時系列順にソート
		Find(&messages); result.Error != nil {
		return nil, result.Error
	}

	// レスポンス整形
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
