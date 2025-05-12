//SQLとバックエンドを接続するプログラム
package db

import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "os"
)//ORMライブラリ。SQLを書かずにデータの構造体を変更

var DB *gorm.DB

func Connect() error {//データベースとmain.goをつなげる関数
    dsn := os.Getenv("DB_DSN")
    var err error
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    return err
}

// GORMで使うUserのモデル。DBに保存するため（永続化）
type UserModel struct {
    ID    uint   `gorm:"primaryKey"`
    Name  string
    Email string
}

func (UserModel) TableName() string {
    return "users" // ← 実際のテーブル名に合わせる
}