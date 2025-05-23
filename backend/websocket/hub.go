package websocket

import (
	"log"
	"encoding/json"
)

type Hub struct {
	Clients    map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan []byte
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
			// Broadcast で受け取った []byte を JSON にパース
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

			// 同じルームのクライアントにのみ送信
			for client := range h.Clients {
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
