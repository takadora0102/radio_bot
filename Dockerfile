# ベースとなる公式Node.jsイメージを選択
FROM node:18-slim

# Open JTalk本体と、音声ファイル取得に必要なツールをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    open-jtalk \
    open-jtalk-mecab-naist-jdic \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# MMDAgentのサンプルから「メイ」の音声ファイルを直接ダウンロードして配置
RUN cd /usr/share && \
    wget -O MMDAgent_Example.zip "https://ja.osdn.net/projects/mmdagent/downloads/65 MMDAgent_Example-1.8.zip" && \
    unzip MMDAgent_Example.zip && \
    mkdir -p hts-voice/mei && \
    mv MMDAgent_Example-1.8/Voice/mei/mei_normal.htsvoice hts-voice/mei/ && \
    rm -rf MMDAgent_Example.zip MMDAgent_Example-1.8

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