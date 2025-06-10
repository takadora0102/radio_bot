# Radio Bot

A Discord bot that reads news articles aloud in voice channels.

This bot requires **Node.js 18** or later.
## Setup

1. Ensure Node.js 18+ is installed.

2. Install dependencies:
   ```sh
   npm install
   ```
   This installs all npm packages, including the **dotenv** module.

   If you plan to use the built-in text-to-speech feature, install the
   following packages (for Debian/Ubuntu):
   ```sh
   sudo apt-get install open-jtalk open-jtalk-mecab-naist-jdic \
       open-jtalk-hts-voice-mei
   ```
3. Prepare a `.env` file with the following variables:
   ```
   BOT_TOKEN=<your bot token>
   CLIENT_ID=<application client id>
   OWNER_ID=<discord user id>
   NEWSAPI_KEY=<NewsAPI key>
   GNEWS_KEY=<GNews key>
   NEWSAPI_DAILY_LIMIT=100
   GNEWS_DAILY_LIMIT=100
   NEWSAPI_THRESHOLD=10
   QUEUE_MAX=5
   REDIS_URL=redis://localhost:6379
   VOICE_SPEED=1.0
   VOICE_VOLUME=100
   ```

4. Deploy slash commands:
   ```sh
   npm run deploy-commands
   ```

5. Start the bot:
   ```sh
   npm start
   ```
