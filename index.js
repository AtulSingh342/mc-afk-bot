const mineflayer = require('mineflayer');
const http = require('http');

// Bind HTTP server for Render port check
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('AFK Bot Running 24/7\n');
}).listen(PORT, () => {
  console.log(`🌐 Web server active on port ${PORT}`);
});

const CONFIG = {
  host: 'play.battlepie.net',
  port: 25565,
  username: 'Sanya_Plays',
  password: 'Sanya0990'
};

function createBot() {
  console.log('🔄 Connecting to Minecraft Server...');

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: '1.20.2',
    checkTimeoutInterval: 120000,
    connectTimeout: 60000
  });

  let loggedIn = false;

  bot.once('login', () => {
    console.log('⚡ Connected to proxy/server! Waiting for spawn...');
  });

  bot.on('spawn', () => {
    console.log(`✅ [${CONFIG.username}] Successfully spawned in-game!`);

    setTimeout(() => {
      if (!loggedIn) {
        loggedIn = true;
        console.log('🔑 Sending login command...');
        bot.chat(`/login ${CONFIG.password}`);

        setTimeout(() => {
          bot.chat('/economy');
        }, 2000);
      }
    }, 2500);
  });

  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString();
    console.log(`[CHAT] ${msg}`);

    if ((msg.includes('/login') || msg.includes('register') || msg.includes('password')) && !loggedIn) {
      loggedIn = true;
      bot.chat(`/login ${CONFIG.password}`);
      setTimeout(() => bot.chat('/economy'), 2000);
    }
  });

  // Anti-AFK movements
  setInterval(() => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 400);
    }
  }, 15000);

  bot.on('end', (reason) => {
    console.log(`⚠️ Disconnected (${reason}). Reconnecting in 10s...`);
    setTimeout(createBot, 10000);
  });

  bot.on('error', (err) => {
    console.log('❌ Connection Error:', err.message);
  });
}

createBot();