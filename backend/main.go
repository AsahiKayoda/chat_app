package main

import (
    "log"
    "net/http"
    "backend/db"
)

func main() {
    if err := db.Connect(); err != nil {
        log.Fatal("DB接続失敗:", err)
    }

    log.Println("DB接続成功！")

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, chat app!"))
    })

    log.Println("サーバー起動中 http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

