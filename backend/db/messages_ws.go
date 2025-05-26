package db

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

func MarkMessageAsRead(db *gorm.DB, messageID, userID uint) error {
	read := &MessageReadModel{
		MessageID: messageID,
		UserID:    userID,
		ReadAt:    time.Now(),
	}
	// INSERT ON CONFLICT DO NOTHING
	return db.Clauses(clause.OnConflict{DoNothing: true}).Create(read).Error
}

func IsUserInRoom(userID int, roomID int) bool {
	var count int64
	err := DB.
		Model(&RoomMemberModel{}).
		Where("user_id = ? AND room_id = ?", userID, roomID).
		Count(&count).Error

	if err != nil {
		log.Println("❌ ユーザーのルーム所属チェック失敗:", err)
		return false
	}

	return count > 0
}

func GetUnreadMessages(db *gorm.DB, userID uint) ([]*MessageModel, error) {
	var messages []*MessageModel

	err := db.
		Raw(`
			SELECT * FROM messages m
			WHERE m.id NOT IN (
				SELECT message_id FROM message_reads WHERE user_id = ?
			)
			AND m.sender_id != ?
			ORDER BY m.created_at ASC
		`, userID, userID).
		Scan(&messages).Error

	return messages, err
}
