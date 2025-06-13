# ベースとなる公式Node.jsイメージを選択
FROM node:18-slim

# Open JTalkと関連パッケージをインストールする
# m100という女性音声をインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    open-jtalk \
    open-jtalk-mecab-naist-jdic \
    hts-voice-m100-jp \
    && rm -rf /var/lib/apt/lists/*

# コンテナ内の作業ディレクトリを設定
WORKDIR /usr/src/app

# 依存関係のファイルを先にコピー
COPY package*.json ./

# 本番環境に必要なパッケージのみインストール
RUN npm install --production

# アプリケーションのソースコードをコピー
COPY . .

# Renderが接続するポートを公開
EXPOSE 10000

# アプリケーションを起動するコマンド
CMD [ "node", "index.js" ]