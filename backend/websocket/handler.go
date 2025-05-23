package websocket

import (
    "log"
    "net/http"
    "strings"
	"fmt"
	"os"

    "github.com/gorilla/websocket"
    "backend/middleware"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

var hubInstance *Hub

// Hub を1回だけ初期化してグローバルに保持
func InitWebSocketHub() {
	hubInstance = &Hub{
		Clients:    make(map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan []byte),
	}
	go hubInstance.Run()
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	// ✅ まず Authorization ヘッダーを取得（正しいキー名）
	authHeader := r.Header.Get("Authorization")

	// ✅ fallback: クエリパラメータに token があれば使う
	if authHeader == "" {
		token := r.URL.Query().Get("token")
		if token != "" {
			authHeader = "Bearer " + token
		}
	}

	// ✅ 認証チェック
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}


	secret := os.Getenv("JWT_SECRET")
	fmt.Println("JWT_SECRET:", secret) // ログ確認用

	if secret == "" {
		http.Error(w, "Server misconfigured (no secret)", http.StatusInternalServerError)
		return
	}


    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    userID, err := middleware.ExtractUserIDFromToken(tokenString, secret)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    roomID := r.URL.Query().Get("room_id")
    if roomID == "" {
        http.Error(w, "Missing room_id", http.StatusBadRequest)
        return
    }

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("WebSocket upgrade error:", err)
        return
    }

    	// ✅ Client を作成し、Hub に登録
	client := &Client{
		Conn:   conn,
		UserID: userID,
		RoomID: roomID,
		Send:   make(chan []byte, 256),
	}

	hubInstance.Register <- client

	// ✅ 接続後は read/write pump を起動
	go client.writePump()
	go client.readPump(hubInstance)
}