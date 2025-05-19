//1対1チャット関連API
package impl

import (
	"context"
	"errors"
	"time"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware" // ← contextから userID 取得
)

func (h *HandlerImpl) ChatRoomsPost(ctx context.Context, req *gen.ChatRoomInput) (*gen.ChatRoomsPostOK, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, errors.New("unauthorized")
	}

	targetID := req.TargetUserID

	if userID == targetID {
		return nil, errors.New("cannot create 1-on-1 chat with yourself")
	}	

	// ✅ 既存ルームの厳密な検索（userAとuserBのみが参加している1対1ルーム）
	/*
	EXISTS で「そのルームに userID がいるか」
	EXISTS で「そのルームに targetID がいるか」
	COUNT(*) = 2 で「そのルームのメンバー数がちょうど2人か」
	*/
	var room db.ChatRoomModel
	err := db.DB.Raw(`
		SELECT r.*
		FROM chat_rooms r
		WHERE r.is_group = false
		AND EXISTS (
			SELECT 1 FROM room_members WHERE room_id = r.id AND user_id = ?
		)
		AND EXISTS (
			SELECT 1 FROM room_members WHERE room_id = r.id AND user_id = ?
		)
		AND (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) = 2
		LIMIT 1
	`, userID, targetID).Scan(&room).Error


	if err == nil && room.ID != 0 {
		// ✅ 既存ルームが見つかったら返す
		return &gen.ChatRoomsPostOK{
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
		{RoomID: room.ID, UserID: uint(userID), JoinedAt: time.Now()},
		{RoomID: room.ID, UserID: uint(targetID), JoinedAt: time.Now()},
	}
	if err := db.DB.Create(&members).Error; err != nil {
		return nil, err
	}

	// ✅ レスポンス構築
	return &gen.ChatRoomsPostOK{
		ID:        int(room.ID),
		IsGroup:   room.IsGroup,
		CreatedAt: room.CreatedAt,
	}, nil
}
