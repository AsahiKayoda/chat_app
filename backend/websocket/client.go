//client.go
package websocket

import (
	"encoding/json"
	"log"
	"strconv"
	"time"

	"backend/db"
	"github.com/gorilla/websocket"
)

///////////////////////////////////////////////////////////
// WebSocketの接続を表すClient構造体と通信処理
///////////////////////////////////////////////////////////

// Client は1つのWebSocket接続を表す構造体
type Client struct {
	Conn   *websocket.Conn // WebSocket接続本体
	UserID int             // 接続ユーザーのID（JWTで取得）
	RoomID string
	Send   chan []byte     // 送信待ちメッセージ（JSON化されたデータ）
}

// MessagePayload はクライアントからの受信用メッセージ構造体
type MessagePayload struct {
	Type   string `json:"type"`
	UserID int    `json:"user_id"`
	RoomID string `json:"room_id"`
	Text   string `json:"text"`
	MessageIDs []uint  `json:"message_ids"`
}

type BroadcastMessage struct {
	Type      string `json:"type"`
	UserID    int    `json:"user_id"`
	RoomID    string `json:"room_id"`
	Text      string `json:"text"`
	Timestamp string `json:"timestamp"`
	ID        uint   `json:"id"`
	Attachments []string `json:"attachments"`
}

// 時間関連の定数
const (
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	writeWait  = 10 * time.Second
)

///////////////////////////////////////////////////////////
// 読み取り処理（クライアント → サーバー）
///////////////////////////////////////////////////////////

func (c *Client) readPump(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, msg, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			break
		}
		//log.Println("📩 メッセージ受信:", string(msg)) // ← 追加①

		var payload MessagePayload
		if err := json.Unmarshal(msg, &payload); err != nil {
			log.Println("❌ JSONデコード失敗:", err) //
			continue
		}
		//log.Printf("✅ JSONパース成功: type=%s user_id=%d room_id=%s", payload.Type, payload.UserID, payload.RoomID) // ← 追加③
		switch payload.Type {//役割ごとにウェブ通信をスイッチする
		case "read":
			log.Printf("📨 read通知受信: room_id=%s", payload.RoomID)
			for _, msgID := range payload.MessageIDs {
				err := db.MarkMessageAsRead(db.DB, msgID, uint(payload.UserID))
				if err != nil {
					log.Println("DB既読保存失敗:", err)
				} else {
					log.Printf("✅ 既読保存 message_id=%d user_id=%d", msgID, payload.UserID)
				}
			}
			readPayload := struct {
				Type   string `json:"type"`
				RoomID string `json:"room_id"`
				MessageIDs []uint  `json:"message_ids"`
				UserID     int     `json:"user_id"`
			}{
				Type:   "read",
				RoomID: payload.RoomID,
				MessageIDs: payload.MessageIDs,
				UserID:     payload.UserID,
			}

			jsonBytes, err := json.Marshal(readPayload)
			if err != nil {
				log.Println("marshal error (read):", err)
				continue
			}

			hub.Broadcast <- jsonBytes

		case "message":
			// 既存のメッセージ保存処理をここに移動
			roomIDInt, err := strconv.Atoi(payload.RoomID)
			if err != nil {
				log.Println("invalid room_id (not int):", err)
				continue
			}

			saved, err := db.SaveMessage(db.DB, roomIDInt, payload.UserID, payload.Text)
			if err != nil {
				log.Println("DB保存失敗:", err)
				continue
			}


			// ② 添付レコードを全件取得
			atts, err := db.GetAttachmentsByMessageID(db.DB, saved.ID)
			if err != nil {
				log.Println("添付取得失敗:", err)
				// ここでは空リストで続行してもOK
			}

			// ③ URLスライスに変換
			var urls []string
			for _, att := range atts {
				urls = append(urls, "/uploads/"+att.FileName)
			}

			broadcastPayload := BroadcastMessage{
				Type:      "message",
				UserID:    saved.SenderID,
				RoomID:    strconv.Itoa(saved.RoomID),
				Text:      saved.Content,
				Timestamp: saved.CreatedAt.Format(time.RFC3339),
				ID:        saved.ID,
				Attachments: urls,
			}

			jsonBytes, err := json.Marshal(broadcastPayload)
			if err != nil {
				log.Println("marshal error:", err)
				continue
			}

			hub.Broadcast <- jsonBytes

		default:
			log.Println("⚠️ 未対応のtype:", payload.Type)
		}



	}
}

///////////////////////////////////////////////////////////
// 書き込み処理（サーバー → クライアント）
///////////////////////////////////////////////////////////

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Println("write error:", err)
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Println("ping error:", err)
				return
			}
		}
	}
}
