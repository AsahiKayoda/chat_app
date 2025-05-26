package websocket

import (
	"log"
	"encoding/json"
	"strconv" 
	"backend/db"
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
			log.Printf("✅ クライアント接続: user_id=%d", client.UserID) // ✅ RoomID削除

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

			roomIDStr, ok := msgMap["room_id"].(string)
			if !ok {
				log.Println("❌ room_id not found or invalid")
				continue
			}

			roomIDInt, err := strconv.Atoi(roomIDStr)
			if err != nil {
				log.Println("❌ room_id parse error:", err)
				continue
			}

			for client := range h.Clients {
				if db.IsUserInRoom(client.UserID, roomIDInt) {
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
