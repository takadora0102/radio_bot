# ベースイメージとしてNode.js 18のslimバージョンを使用
FROM node:18-slim

# aptパッケージリストを更新し、必要なパッケージをインストール
# open-jtalkとその辞書、wget、unzipをインストール
# インストール後にaptキャッシュをクリーンアップ
RUN apt-get update && apt-get install -y --no-install-recommends \
    open-jtalk \
    open-jtalk-mecab-naist-jdic \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# /usr/shareディレクトリに移動
WORKDIR /usr/share

# MMDAgentのサンプルから「メイ」の音声ファイルを直接ダウンロードして配置
# --no-check-certificate を追加してSSL証明書のエラーを回避
RUN mkdir -p /usr/share/hts-voice/tohoku-f01 && \
    wget --no-check-certificate -O /usr/share/hts-voice/tohoku-f01/neutral.htsvoice "https://github.com/icn-lab/htsvoice-tohoku-f01/raw/master/htsvoice/tohoku-f01-neutral/tohoku-f01-neutral.htsvoice"

# アプリケーションの作業ディレクトリを作成
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
# 本番環境の依存関係のみをインストール
RUN npm install --omit=dev

# アプリケーションのソースコードをコピー
COPY . .

# ポート3000を公開
EXPOSE 3000

# アプリケーションを起動
# botディレクトリ内のindex.jsを実行
CMD ["node", "bot/index.js"]