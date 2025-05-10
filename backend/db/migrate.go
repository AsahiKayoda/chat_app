package db

import (
    "backend/models"
)

func Migrate() error {
    return DB.AutoMigrate(&models.User{}, &models.Message{})
}
