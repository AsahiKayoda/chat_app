//テーブルの定義
package models

import "time"

type Message struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Content   string    `gorm:"type:text;not null" json:"content"`
    UserID    uint      `gorm:"not null" json:"user_id"`
    CreatedAt time.Time `json:"created_at"`

    User User `gorm:"foreignKey:UserID" json:"user"` // リレーション（オプション）
}
