# Dockerfile
# ベースイメージとして Node.js 18 を指定
FROM node:18-slim

# open-jtalk と依存パッケージをインストール
# apt-get の警告を抑制するために DEBIAN_FRONTEND を noninteractive に設定
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    open-jtalk \
    open-jtalk-mecab-naist-jdic \
    open-jtalk-hts-voice-mei && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# アプリケーションの依存関係をインストール
# package.json と package-lock.json をコピーして、キャッシュを有効活用する
COPY package*.json ./
RUN npm install --omit=dev

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションの起動コマンド
CMD [ "npm", "start" ]