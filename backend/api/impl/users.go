package impl

import (
	"context"

	"backend/db"
	gen "backend/api/gen"
)

func (h *HandlerImpl) UsersGet(ctx context.Context) (gen.UsersGetRes, error) {
	var users []db.UserModel
	if result := db.DB.Find(&users); result.Error != nil {
		return nil, result.Error
	}

	var resp []gen.User
	for _, u := range users {
		resp = append(resp, gen.User{
			ID:   int(u.ID),
			Name: u.Username,
		})
	}

	return (*gen.UsersGetOKApplicationJSON)(&resp), nil
}
