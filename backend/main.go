package main

import (
	"log"
	"net/http"

	"backend/db"
	gen "backend/api/gen"
	impl "backend/api/impl"
)

// ✅ CORSを許可するミドルウェア（開発用）
func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 全てのオリジンを許可（本番では限定するのがベター）
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// クライアントから送られるヘッダーを許可
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 許可するHTTPメソッド
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Preflightリクエスト（OPTIONS）への対応
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 実際のハンドラーに処理を渡す
		h.ServeHTTP(w, r)
	})
}

func main() {
	// DB接続
	if err := db.Connect(); err != nil {
		log.Fatalf("❌ データベース接続に失敗: %v", err)
	}
	log.Println("✅ データベース接続成功")

	// Handler を実装にバインド
	handler := &impl.HandlerImpl{}

	// ogen が生成した HTTPサーバを取得
	server, err := gen.NewServer(handler)
	if err != nil {
		log.Fatalf("❌ サーバー生成に失敗: %v", err)
	}
	log.Println("✅ サーバー構築成功4")

	// ✅ CORSミドルウェアを通してサーバー起動
	log.Println("🚀 サーバー起動: http://localhost:8080")
	if err := http.ListenAndServe(":8080", withCORS(server)); err != nil {
		log.Fatalf("❌ サーバー起動エラー: %v", err)
	}
}
