package impl

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"backend/db"
	gen "backend/api/gen"
	"backend/middleware"

	"github.com/google/uuid"
)

type Message struct {
	ID        int       `json:"id"`
	SenderID  int       `json:"sender_id"`
	RoomID    int       `json:"room_id"`
	Text      string    `json:"text"`
	Timestamp time.Time `json:"timestamp"`
	IsRead    gen.OptBool `json:"is_read"`
	Attachments []gen.Attachment `json:"attachments"` // ✅ 追加！
}


const uploadDir = "uploads"

func (h *HandlerImpl) UploadMessageAttachment(ctx context.Context, req *gen.UploadMessageAttachmentReq, params gen.UploadMessageAttachmentParams) (gen.UploadMessageAttachmentRes, error) {
	// 認証チェック
	_, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		return &gen.UploadMessageAttachmentBadRequest{}, errors.New("unauthorized")
	}

	messageID := params.MessageID

	// メッセージ存在チェック
	var message db.MessageModel
	if result := db.DB.First(&message, messageID); result.Error != nil {
		return &gen.UploadMessageAttachmentNotFound{}, fmt.Errorf("message not found: %w", result.Error)
	}

	// ファイルが存在しない
	file, ok := req.File.Get()
	if !ok {
		return &gen.UploadMessageAttachmentBadRequest{}, errors.New("no file provided")
	}

	// 保存用ファイル名生成
	ext := filepath.Ext(file.Name)
	filename := uuid.New().String() + ext
	path := filepath.Join(uploadDir, filename)

	// 保存ディレクトリがなければ作成
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// ファイル保存
	dst, err := os.Create(path)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file.File); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	// DBに保存
	now := time.Now()
	attachment := db.MessageAttachmentModel{
		MessageID:  uint(messageID),
		FileName:   filename,
		CreatedAt:  now,
	}
	if result := db.DB.Create(&attachment); result.Error != nil {
		return nil, fmt.Errorf("failed to save attachment to DB: %w", result.Error)
	}

	// URL（フロント表示用）
	fileURL := "/uploads/" + filename

	// レスポンスを返す
	return &gen.Attachment{
		ID:        gen.NewOptInt(int(attachment.ID)),
		MessageID: gen.NewOptInt(messageID),
		FileName:  gen.NewOptString(filename),
		URL:       gen.NewOptString(fileURL),
		CreatedAt: gen.NewOptDateTime(now),
	}, nil
}
