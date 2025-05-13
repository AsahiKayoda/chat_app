package impl

import (
	"context"

	"backend/db"
	gen "backend/api/gen"
	"golang.org/x/crypto/bcrypt"
)

type HandlerImpl struct{}

func (h *HandlerImpl) SignupPost(ctx context.Context, req *gen.UserInput) (gen.SignupPostRes, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := db.UserModel{
		Username:     req.Name,
		PasswordHash: string(hashedPassword),
	}

	if result := db.DB.Create(&user); result.Error != nil {
		return nil, result.Error
	}

	return &gen.SignupResponse{
		ID:   int(user.ID),
		Name: user.Username,
	}, nil
}
