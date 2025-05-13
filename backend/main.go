package main

import (
	"log"
	"net/http"

	"backend/db"
	gen "backend/api/gen"
	impl "backend/api/impl"
)

func main() {
	// DB接続
	if err := db.Connect(); err != nil {
		log.Fatalf("❌ データベース接続に失敗: %v", err)
	}
	log.Println("✅ データベース接続成功")

	// Handler を実装にバインド
	handler := &impl.HandlerImpl{}

	// ogen が生成した HTTPサーバを起動
	server, err := gen.NewServer(handler)
	if err != nil {
		log.Fatalf("❌ サーバー生成に失敗: %v", err)
	}
	log.Println("✅ サーバー構築成功2")
	log.Println("🚀 サーバー起動2: http://localhost:8080")

	if err := http.ListenAndServe(":8080", server); err != nil {
		log.Fatalf("❌ サーバー起動エラー: %v", err)
	}


}