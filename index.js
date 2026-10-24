const mineflayer = require('mineflayer');
const http = require('http');

// Render Port Listener
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AFK Bot active\n');
}).listen(PORT, () => {
  console.log(`🌐 Web listener running on port ${PORT}`);
});

const CONFIG = {
  host: 'play.battlepie.net',
  port: 25565,
  username: 'Sanya_Plays',
  password: 'Sanya0990'
};

function createBot() {
  console.log('🔄 Attempting direct TCP handshake...');

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: false, // Auto-detect Minecraft version
    checkTimeoutInterval: 60000,
    connectTimeout: 45000,
    skipValidation: true
  });

  let loggedIn = false;

  bot.once('login', () => {
    console.log('⚡ Handshake successful! Connecting to world...');
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
    }, 2000);
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

  // Keep-alive jump
  setInterval(() => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 350);
    }
  }, 15000);

  bot.on('end', (reason) => {
    console.log(`⚠️ Disconnected (${reason}). Reconnecting in 5s...`);
    setTimeout(createBot, 5000);
  });

  bot.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
  });
}

createBot();