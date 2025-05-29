package main

import (
	"log"
	"net/http"
	"os"
//	"fmt"

	gen "backend/api/gen"
	"backend/api/impl"
	"backend/db"
	"backend/middleware" //JWTミドルウェア
	"backend/websocket"//
//	"backend/mentions"
)

// ✅ 開発用CORSミドルウェア
func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 全オリジン許可（本番では制限推奨）
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// 使用を許可するヘッダー
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 許可するHTTPメソッド
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Preflight（OPTIONS）対応
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 次のミドルウェア or 実処理へ
		h.ServeHTTP(w, r)
	})
}

func main() {
	// ✅ JWT_SECRETを環境変数から取得
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("❌ JWT_SECRET が設定されていません")
	}

	// ✅ DB接続
	if err := db.Connect(); err != nil {
		log.Fatalf("❌ データベース接続に失敗: %v", err)
	}
	log.Println("✅ データベース接続成功")

	// ✅ Handler 実装
	handler := &impl.HandlerImpl{}

	// ✅ SecurityHandler を渡す
	server, err := gen.NewServer(handler, &impl.Security{})
	if err != nil {
		log.Fatalf("❌ サーバー生成に失敗: %v", err)
	}
	log.Println("✅ ogen サーバー構築成功")


	// ✅ JWT認証ミドルウェアでラップ（JWT → ogen）
	jwtWrapped := middleware.JWTAuthMiddleware(secret)(server)

	// ✅ CORSミドルウェアでさらにラップ（CORS → JWT → ogen）
	finalHandler := withCORS(jwtWrapped)

	// ✅ WebSocketハブの初期化
	websocket.InitWebSocketHub()

	// ✅ ServeMux にルート登録
	mux := http.NewServeMux()

	// ✅ 認証なしで公開する静的ファイル：/uploads/*
	fs := http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads")))
	mux.Handle("/uploads/", withCORS(fs)) // ← 認証なしでCORSつき

	// /ws は WebSocket 専用
	mux.HandleFunc("/ws", websocket.WebSocketHandler)

	// /（それ以外）は ogen + JWT + CORS などを通したAPI
	mux.Handle("/", finalHandler)

/*
	text := "こんにちは @kayoda さんと @taro_123 に連絡しました"
	usernames := mentions.ExtractMentionUsernames(text)
	fmt.Println(usernames) // → ["kayoda", "taro_123"]
*/

	// ✅ 最終起動
	log.Println("🚀 サーバー起動: http://localhost:8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("❌ サーバー起動エラー: %v", err)
	}

}
