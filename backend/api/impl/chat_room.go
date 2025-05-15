package impl

import (
	"context"
	"errors"
	"time"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware" // ← contextから userID 取得
)

func (h *HandlerImpl) ChatRoomsPost(ctx context.Context, req *gen.ChatRoomInput) (*gen.ChatRoom, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, errors.New("unauthorized")
	}

	targetID := req.TargetUserID

	// ✅ 既存ルームがあるか確認（自前でクエリ実装）
	var room db.ChatRoomModel
	err := db.DB.Raw(`
		SELECT r.*
		FROM chat_rooms r
		JOIN room_members m1 ON r.id = m1.room_id
		JOIN room_members m2 ON r.id = m2.room_id
		WHERE r.is_group = false
		  AND m1.user_id = ? AND m2.user_id = ?
		LIMIT 1
	`, userID, targetID).Scan(&room).Error

	if err == nil && room.ID != 0 {
		// ✅ 既存ルームが見つかったら返す
		return &gen.ChatRoom{
			ID:        int(room.ID),
			IsGroup:   room.IsGroup,
			CreatedAt: room.CreatedAt,
		}, nil
	}

	// ✅ 新規ルーム作成
	room = db.ChatRoomModel{
		IsGroup:   false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.DB.Create(&room).Error; err != nil {
		return nil, err
	}

	// ✅ 2人をメンバー登録
	members := []db.RoomMemberModel{
		{RoomID: int(room.ID), UserID: userID, JoinedAt: time.Now()},
		{RoomID: int(room.ID), UserID: targetID, JoinedAt: time.Now()},
	}
	if err := db.DB.Create(&members).Error; err != nil {
		return nil, err
	}

	// ✅ レスポンス構築
	return &gen.ChatRoom{
		ID:        int(room.ID),
		IsGroup:   room.IsGroup,
		CreatedAt: room.CreatedAt,
	}, nil
}
