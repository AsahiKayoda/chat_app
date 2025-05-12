package api

import (
	"context"
	"net/http"

	"backend/db"
	gen "backend/api/gen"
	"golang.org/x/crypto/bcrypt"
)

// HandlerImpl implements the ogen-generated handler interface
type HandlerImpl struct{}

// NewError handles errors and returns a standardized response
func (h *HandlerImpl) NewError(ctx context.Context, err error) *gen.ErrorStatusCode {
	return &gen.ErrorStatusCode{
		StatusCode: http.StatusInternalServerError,
		Response: gen.Error{
			Message: err.Error(),
		},
	}
}

// /signup（ユーザー登録）
// POST /users
func (h *HandlerImpl) UsersPost(ctx context.Context, req *gen.UserInput) (*gen.User, error) {
	// パスワードをハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// UserModel に保存
	user := db.UserModel{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	if result := db.DB.Create(&user); result.Error != nil {
		return nil, result.Error
	}

	// ここを修正
	return &gen.User{
		ID:    int(user.ID),
		Name:  user.Name,
		Email: user.Email,
	}, nil
}
