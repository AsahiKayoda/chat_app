//SQLとバックエンドを接続するプログラム
package db

import (//ORMライブラリ。SQLを書かずにデータの構造体を変更
    "gorm.io/driver/postgres"
    "gorm.io/gorm"

    "os"
    "time"
)

var DB *gorm.DB

func Connect() error {//データベースとmain.goをつなげる関数
    dsn := os.Getenv("DB_DSN")
    var err error
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    return err

}

// GORMで使うUserのモデル。DBに保存するため（永続化）
type UserModel struct {
	ID           uint      `gorm:"primaryKey"`
	Username     string    `gorm:"not null"`
	Email        string    `gorm:"not null;unique"`
	PasswordHash string    `gorm:"not null"`
}

func (UserModel) TableName() string {
	return "users"
}

type MessageModel struct {
	ID            uint      `gorm:"primaryKey"`
	RoomID        int       `gorm:"not null"`
	SenderID      int       `gorm:"not null"`
	Content       string    `gorm:"not null"`
	CreatedAt     time.Time `gorm:"autoCreateTime"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"`
	ThreadRootID  *int      // スレッド機能用（NULL許容）
}

// テーブル名を明示
func (MessageModel) TableName() string {
	return "messages"
}

type ChatRoomModel struct {
	ID        uint       `gorm:"primaryKey"`                // ルームID（PK）
	RoomName  *string    `gorm:"type:varchar(100);default:null"` // グループ名（1:1のときはNULL）
	IsGroup   bool       `gorm:"not null;default:false"`    // true:グループ, false:1:1
	CreatedAt time.Time  `gorm:"autoCreateTime"`            // 作成日時
	UpdatedAt time.Time  `gorm:"autoUpdateTime"`            // 更新日時
}

// 明示的にテーブル名を指定
func (ChatRoomModel) TableName() string {
	return "chat_rooms"
}

type RoomMemberModel struct {
	RoomID   int       `gorm:"primaryKey"`      // 複合PKの一部
	UserID   int       `gorm:"primaryKey"`      // 複合PKの一部
	JoinedAt time.Time `gorm:"autoCreateTime"`  // 参加日時
}

// テーブル名を指定（デフォルトの複数形ではなく一致させるため）
func (RoomMemberModel) TableName() string {
	return "room_members"
}