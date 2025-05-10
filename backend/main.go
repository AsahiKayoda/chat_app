package main

import (
    "log"
    "net/http"
    "backend/db"
    "backend/api"
)

func main() {
    if err := db.Connect(); err != nil {
        log.Fatal("DB接続失敗:", err)
    }

    handler, err := api.NewServer(api.NewStrictHandler(&api.Server{}, nil))
    if err != nil {
        log.Fatal(err)
    }

    log.Println("サーバー起動中 http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
