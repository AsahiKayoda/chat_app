// backend/middleware/jwt.go

package middleware

import (
    "context"
    "net/http"
    "strings"

    "github.com/golang-jwt/jwt/v5"
)

// コンテキストで使うキーの定義
type contextKey string

const userIDKey = contextKey("userID")

// JWTAuthMiddleware はJWTトークンの検証を行うミドルウェア
func JWTAuthMiddleware(secretKey string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // 認証不要なパスはスキップ
            if strings.HasPrefix(r.URL.Path, "/login") || strings.HasPrefix(r.URL.Path, "/signup") {
                next.ServeHTTP(w, r)
                return
            }

            // Authorization ヘッダーからトークン取得
            authHeader := r.Header.Get("Authorization")
            if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
                http.Error(w, "Unauthorized (missing token)", http.StatusUnauthorized)
                return
            }

            // "Bearer " の接頭辞を取り除く
            tokenString := strings.TrimPrefix(authHeader, "Bearer ")

            // トークンをパースして署名を検証
            token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
                return []byte(secretKey), nil
            })
            if err != nil || !token.Valid {
                http.Error(w, "Unauthorized (invalid token)", http.StatusUnauthorized)
                return
            }

            // クレーム（payload）を取得
            claims, ok := token.Claims.(jwt.MapClaims)
            if !ok || claims["user_id"] == nil {
                http.Error(w, "Unauthorized (invalid claims)", http.StatusUnauthorized)
                return
            }

            // user_id を context に埋め込む
            userID := int(claims["user_id"].(float64)) // float64になるためint変換必要
            ctx := context.WithValue(r.Context(), userIDKey, userID)

            // 次のハンドラーに進む（context付き）
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// ハンドラー内で userID を取り出すための関数
func GetUserIDFromContext(ctx context.Context) (int, bool) {
    userID, ok := ctx.Value(userIDKey).(int)
    return userID, ok
}
