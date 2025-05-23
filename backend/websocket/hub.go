//全ての接続中ユーザー（Client）を管理する
package websocket

import (
	"log"
	"encoding/json"
)
// Hub manages all active clients and broadcasts messages.
type Hub struct {
	Clients    map[*Client]bool        // 現在接続中のクライアント
	Register   chan *Client            // 新しい接続要求
	Unregister chan *Client            // 切断要求
	Broadcast  chan []byte             // ブロードキャスト対象のメッセージ
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true
			log.Printf("✅ クライアント接続: user_id=%d room_id=%s", client.UserID, client.RoomID)

		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}

		case message := <-h.Broadcast:
			// ✅ message は []byte（JSON）なのでそのまま送信すればOK

			for client := range h.Clients {
				// ✅ 特定のルームに送信する場合は、JSONから一時的にパースする必要がある
				var msgMap map[string]interface{}
				if err := json.Unmarshal(message, &msgMap); err != nil {
					log.Println("unmarshal error in hub:", err)
					continue
				}

				roomID, ok := msgMap["room_id"].(string)
				if !ok {
					log.Println("invalid room_id in broadcast message")
					continue
				}

				if client.RoomID == roomID {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(h.Clients, client)
					}
				}
			}
		}
	}
}