//グループチャット作成 名前とメンバーを指定してグループ作成
package impl

import (
	"context"
	"errors"
	"time"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware"
)

func (h *HandlerImpl) CreateGroupChatRoom(ctx context.Context, req *gen.CreateGroupChatInput) (*gen.ChatRoom, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, errors.New("unauthorized")
	}

	// 重複排除：自分がすでに含まれていないかチェックしてから追加
	//[2, 3, 2] のように2が2回あっても、mapには1回しか入らない
	memberIDMap := make(map[uint]bool)
	for _, id := range req.MemberIds {
		memberIDMap[uint(id)] = true
	}
	memberIDMap[uint(userID)] = true 
	
	// メンバーIDを1回だけ抽出
	//重複を除いた全ユーザーID一覧が memberIDs に入る
	memberIDs := make([]uint, 0, len(memberIDMap))
	for id := range memberIDMap {
		memberIDs = append(memberIDs, id)
	}

	// ✅ チャットルーム作成
	room := db.ChatRoomModel{
		RoomName:  &req.RoomName,
		IsGroup:   true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := db.DB.Create(&room).Error; err != nil {
		return nil, err
	}

	// ✅ メンバー登録
	members := make([]db.RoomMemberModel, 0, len(memberIDs))
	for _, id := range memberIDs {
		members = append(members, db.RoomMemberModel{
			RoomID:   room.ID,
			UserID:   id,
			JoinedAt: time.Now(),
		})
	}
	if err := db.DB.Create(&members).Error; err != nil {
		return nil, err
	}

	// ✅ レスポンス
	return &gen.ChatRoom{
		ID:        gen.NewOptNilInt(int(room.ID)),
		IsGroup:   gen.NewOptNilBool(true),
		CreatedAt: gen.NewOptNilDateTime(room.CreatedAt),
	}, nil

}
