// backend/api/impl.go
package api

import (
  "context"
  "backend/db"
  "backend/models"
)

func (s *Server) CreateUser(ctx context.Context, req *UserInput) (*User, error) {
    user := models.User{Name: req.Name, Email: req.Email}
    if result := db.DB.Create(&user); result.Error != nil {
        return nil, result.Error
    }
    return &User{
        Id:    user.ID,
        Name:  user.Name,
        Email: user.Email,
    }, nil
}
