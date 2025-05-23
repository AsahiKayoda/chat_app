package db

import (
	"gorm.io/gorm"
	"log"
	"time"
)


// メッセージを保存する関数
func SaveMessage(db *gorm.DB, roomID int, senderID int, content string) (*MessageModel, error) {
	msg := &MessageModel{
		RoomID:       roomID,
		SenderID:     senderID,
		Content:      content,
		CreatedAt:    time.Now(),     // 明示的に入れてもOK（なくても良い）
		ThreadRootID: nil,            // 今はスレッド機能未使用なのでnil
	}
	if err := db.Create(msg).Error; err != nil {
		log.Println("❌ DB保存失敗:", err)
		return nil, err
	}
	log.Printf("✅ メッセージ保存成功 → ID: %d", msg.ID)
	return msg, nil
}
