package impl

import (
	"context"
	"errors"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware"
)


// GET /me に対応するハンドラー
func (h *HandlerImpl) GetMe(ctx context.Context) (*gen.User, error) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return nil, errors.New("unauthorized")
	}

	var user db.UserModel
	if err := db.DB.First(&user, userID).Error; err != nil {
		return nil, err
	}

	return &gen.User{
		ID:   int(user.ID),
		Name: user.Username,
	}, nil
}
