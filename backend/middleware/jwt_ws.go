package middleware

import (
	"context"
	"errors"
	"os"
    "github.com/golang-jwt/jwt/v5"
)

// SetUserIDToContextFromJWT は JWT トークンから userID を取り出して context に埋め込む
func SetUserIDToContextFromJWT(ctx context.Context, tokenString string) (context.Context, error) {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		return ctx, errors.New("JWT_SECRET is not set")
	}

	userID, err := ExtractUserIDFromToken(tokenString, secretKey)
	if err != nil {
		return ctx, err
	}

	return context.WithValue(ctx, userIDKey, userID), nil
}

// ExtractUserIDFromToken は JWT トークンを解析し、userID を取得します。
func ExtractUserIDFromToken(tokenString string, secretKey string) (int, error) {
	// jwt/v5 を使ってパース
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil || !token.Valid {
		return 0, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["user_id"] == nil {
		return 0, errors.New("invalid claims")
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		return 0, errors.New("user_id not found")
	}

	return int(userID), nil
}
