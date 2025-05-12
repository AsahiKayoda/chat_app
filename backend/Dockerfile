
#dockerイメージのベース
FROM golang:1.24
#作業場所
WORKDIR /app
#ソースコードをコピー
COPY go.mod ./ 

RUN go mod download

# air をインストール
RUN go install github.com/air-verse/air@latest

COPY . .

# ogen をインストール
RUN go install github.com/ogen-go/ogen/cmd/ogen@latest

# openapi.yaml を元にコードを生成
RUN ogen generate --target ./api/gen --clean ./api/openapi.yaml


# tmpディレクトリの作成とパーミッション修正
RUN mkdir -p ./tmp && chmod -R 777 ./tmp

EXPOSE 8080

CMD ["air"]
