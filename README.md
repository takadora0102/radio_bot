# Radio Bot

A Discord bot that reads news articles aloud in voice channels.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Prepare a `.env` file with the following variables:
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

3. Deploy slash commands:
   ```sh
   npm run deploy-commands
   ```

4. Start the bot:
   ```sh
   npm start
   ```
