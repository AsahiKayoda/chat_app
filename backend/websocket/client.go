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
	RoomID string          // 接続中のチャットルームID（文字列として保持）
	Send   chan []byte     // 送信待ちメッセージ（JSON化されたデータ）
}

// MessagePayload はクライアントからの受信用メッセージ構造体
type MessagePayload struct {
	Type   string `json:"type"`
	UserID int    `json:"user_id"`
	RoomID string `json:"room_id"`
	Text   string `json:"text"`
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
			log.Println("❌ JSONデコード失敗:", err) // ← 追加②
			continue
		}
		//log.Printf("✅ JSONパース成功: type=%s user_id=%d room_id=%s", payload.Type, payload.UserID, payload.RoomID) // ← 追加③


		roomIDInt, err := strconv.Atoi(payload.RoomID)
		if err != nil {
			log.Println("❌ room_id パース失敗:", err) // ← 追加④
			continue
		}
		//log.Println("🚀 DB保存処理を呼び出します") // ← 追加⑤

		
		saved, err := db.SaveMessage(db.DB, roomIDInt, payload.UserID, payload.Text)
		if err != nil {
			log.Println("DB保存失敗:", err)
			continue
		}
		//log.Println("✅ DB保存成功:", saved.ID) // ← 追加⑥

		// ✅ ブロードキャスト用の匿名構造体で timestamp を付ける
		broadcastPayload := struct {
			Type      string `json:"type"`
			UserID    int    `json:"user_id"`
			RoomID    string `json:"room_id"`
			Text      string `json:"text"`
			Timestamp string `json:"timestamp"`
		}{
			Type:      "message",
			UserID:    saved.SenderID,
			RoomID:    strconv.Itoa(saved.RoomID),
			Text:      saved.Content,
			Timestamp: saved.CreatedAt.Format(time.RFC3339),
		}

		jsonBytes, err := json.Marshal(broadcastPayload)
		if err != nil {
			log.Println("marshal error:", err)
			continue
		}

		hub.Broadcast <- jsonBytes
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
