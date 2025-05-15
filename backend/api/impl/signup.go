package impl

import (
	"context"
	"backend/db"
	gen "backend/api/gen"
	"golang.org/x/crypto/bcrypt"
)

type HandlerImpl struct{}
// サインアップ処理
// POST /signup に対応
func (h *HandlerImpl) SignupPost(ctx context.Context, req *gen.UserInput) (gen.SignupPostRes, error) {
	// パスワードをハッシュ化（セキュリティのため）
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 新規ユーザー作成
	user := db.UserModel{
		Username:     req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}

	// DBに保存
	if result := db.DB.Create(&user); result.Error != nil {
		// ここではエラー詳細はそのまま返す
		// フロントエンドで「23505」などを含む文字列から重複判定する
		return nil, result.Error
	}

	// レスポンス返却
	return &gen.SignupResponse{
		ID:   int(user.ID),
		Name: user.Username,
		Email: user.Email,
	}, nil
}
