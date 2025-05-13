package impl

import (
	"context"

	"backend/db"
	gen "backend/api/gen"
)

// ユーザー一覧を取得するハンドラー
// GET /users のエンドポイントに対応
func (h *HandlerImpl) UsersGet(ctx context.Context) (gen.UsersGetRes, error) {
	// DBから全ユーザーを取得
	var users []db.UserModel
	if result := db.DB.Find(&users); result.Error != nil {
		return nil, result.Error
	}

	// レスポンス用に整形
	var resp []gen.User
	for _, u := range users {
		resp = append(resp, gen.User{
			ID:   int(u.ID),
			Name: u.Username,
		})
	}

	// 型変換して返す（ポインタ型にキャスト）
	return (*gen.UsersGetOKApplicationJSON)(&resp), nil
}
