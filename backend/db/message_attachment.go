package db

import (
    "gorm.io/gorm"
)

func GetAttachmentsByMessageID(db *gorm.DB, messageID uint) ([]MessageAttachmentModel, error) {
	var attachments []MessageAttachmentModel
	if err := db.Where("message_id = ?", messageID).Find(&attachments).Error; err != nil {
		return nil, err
	}
	return attachments, nil
}
