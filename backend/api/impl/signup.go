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
		PasswordHash: string(hashedPassword),
	}

	// DBに保存
	if result := db.DB.Create(&user); result.Error != nil {
		return nil, result.Error
	}

	// レスポンス返却
	return &gen.SignupResponse{
		ID:   int(user.ID),
		Name: user.Username,
	}, nil
}
