//すべてのチャットルーム（1対1 / グループ問わず）を取得できるAPI
package impl

import (
	"context"
	"errors"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware" // ← contextから userID 取得
)

func (h *HandlerImpl) GetChatRooms(ctx context.Context) ([]gen.ChatRoom, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, errors.New("unauthorized")
	}

	// ✅ DBから該当ユーザーが所属するチャットルームを取得
	var rooms []db.ChatRoomModel
	err := db.DB.Raw(`
		SELECT r.*
		FROM chat_rooms r
		JOIN room_members m ON r.id = m.room_id
		WHERE m.user_id = ?
		ORDER BY r.updated_at DESC
	`, userID).Scan(&rooms).Error

	if err != nil {
		return nil, err
	}
	// ✅ レスポンス構造体の初期化
	res := make([]gen.ChatRoom, 0, len(rooms))
	// ✅ 各ルーム情報をOpenAPIの型（gen.ChatRoom）に変換
	for _, r := range rooms {
		roomName := gen.OptNilString{}
		if r.RoomName != nil {
			roomName = gen.NewOptNilString(*r.RoomName)
		}
		// gen.ChatRoom 構造体に変換してレスポンス配列に追加
		res = append(res, gen.ChatRoom{
			ID:        gen.NewOptNilInt(int(r.ID)),
			RoomName:  roomName,
			IsGroup:   gen.NewOptNilBool(r.IsGroup),
			CreatedAt: gen.NewOptNilDateTime(r.CreatedAt),
		})
	}
	return res, nil
}
