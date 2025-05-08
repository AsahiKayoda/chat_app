// backend/main.go
package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// 動作確認用シンプルルート
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "ChatApp API 動作中 🚀")
	})

	// サーバー起動
	e.Logger.Fatal(e.Start(":8080"))
}
