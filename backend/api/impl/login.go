package impl

import (
	"context"
	"time"
	"os"

	"backend/db"
	gen "backend/api/gen"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// JWTシークレットキー（環境変数）
var jwtSecret = []byte(getEnv("JWT_SECRET", "secret"))

// POST /login 実装
func (h *HandlerImpl) LoginPost(ctx context.Context, req *gen.LoginRequest) (gen.LoginPostRes, error) {
	// ユーザー名でDB検索
	var user db.UserModel
	if result := db.DB.Where("username = ?", req.Name).First(&user); result.Error != nil {
		// 認証失敗（例: ユーザー存在しない）
		return nil, result.Error
	}

	// パスワード比較
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		// 認証失敗（パスワード不一致）
		return nil, err
	}

	// JWTトークン生成（24時間有効）
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return nil, err
	}
	// トークン返却
	return &gen.LoginResponse{
	Token: tokenString,
	}, nil


}

// 環境変数を取得するユーティリティ関数
func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
