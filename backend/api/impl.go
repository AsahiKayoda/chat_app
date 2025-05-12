
package api

import (
	"context"
	"backend/db"
	gen "backend/api/gen"
)

type HandlerImpl struct{}

// UsersPost implements gen.Handler interface
func (h *HandlerImpl) UsersPost(ctx context.Context, req *gen.UserInput) (*gen.User, error) {
	user := db.UserModel{
		Name:  req.Name,
		Email: req.Email,
	}
	if result := db.DB.Create(&user); result.Error != nil {
		return nil, result.Error
	}
	return &gen.User{
		ID:    int(user.ID),
		Name:  user.Name,
		Email: user.Email,
	}, nil

}
