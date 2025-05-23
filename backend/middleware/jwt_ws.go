// middleware/jwt_ws.go

package middleware

import (
    "errors"
    "github.com/golang-jwt/jwt/v5"
)

// ExtractUserIDFromToken は JWT トークンを解析し、userID を取得します。
func ExtractUserIDFromToken(tokenString string, secretKey string) (int, error) {
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
