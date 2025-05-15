package impl

import (
	"context"
	"errors"
	"time"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware" // ← contextから userID 取得
)

//type HandlerImpl struct{}

// POST /messages - メッセージ送信
func (h *HandlerImpl) MessagesPost(ctx context.Context, req *gen.MessageInput) (*gen.Message, error) {


	
	senderID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, errors.New("unauthorized (no user ID in context)")
	}

	// DBモデルに保存
	msg := db.MessageModel{
		RoomID:    int(req.RoomID),
		SenderID:  senderID,
		Content:   req.Text,
		CreatedAt: time.Now(),
	}

	if result := db.DB.Create(&msg); result.Error != nil {
		return nil, result.Error
	}

	// 作成したメッセージを返す
	return &gen.Message{
		ID:         int(msg.ID),
		SenderID:   int(msg.SenderID),
		RoomID:    int(msg.RoomID),
		Text:       msg.Content,
		Timestamp:  msg.CreatedAt,
	}, nil
}

// GET /messages?receiver_id=X - メッセージ取得（相手とのやり取り）
func (h *HandlerImpl) MessagesGet(ctx context.Context, params gen.MessagesGetParams) ([]gen.Message, error) {
	// ✅ JWTから senderID を取得
	_, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, errors.New("unauthorized")
	}

	var messages []db.MessageModel
	if result := db.DB.
		Where("room_id = ?", params.RoomID).
		Order("created_at asc").
		Find(&messages); result.Error != nil {
		return nil, result.Error
	}

	// レスポンス整形
	var resp []gen.Message
	for _, m := range messages {
		resp = append(resp, gen.Message{
			ID:         int(m.ID),
			SenderID:   int(m.SenderID),
			RoomID:    int(m.RoomID),
			Text:      m.Content,
			Timestamp: m.CreatedAt,
		})
	}

	return resp, nil
}
