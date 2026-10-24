const mineflayer = require('mineflayer');
const http = require('http');

// Render port requirement fix
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AFK Bot is running 24/7!\n');
}).listen(PORT, () => {
  console.log(`🌐 Web server listening on port ${PORT}`);
});

const CONFIG = {
  host: 'play.battlepie.net',
  port: 25565,
  username: 'Sanya_Plays',
  password: 'Sanya0990'
};

function createBot() {
  console.log('🔄 Connecting to server...');

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: '1.20.2',
    checkTimeoutInterval: 120000 // Timeout extended for Cloud IPs
  });

  let loggedIn = false;

  bot.once('login', () => {
    console.log('⚡ Connected to proxy! Waiting for world spawn...');
  });

  bot.on('spawn', () => {
    console.log(`✅ [${CONFIG.username}] Successfully spawned in-game!`);

    setTimeout(() => {
      if (!loggedIn) {
        loggedIn = true;
        console.log('🔑 Sending login command...');
        bot.chat(`/login ${CONFIG.password}`);

        setTimeout(() => {
          console.log('🚀 Sending /economy command...');
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
      console.log('🔑 Password prompt detected!');
      bot.chat(`/login ${CONFIG.password}`);

      setTimeout(() => {
        bot.chat('/economy');
      }, 2000);
    }
  });

  // Anti-AFK Jump
  setInterval(() => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 400);
    }
  }, 20000);

  bot.on('end', (reason) => {
    console.log(`⚠️ Disconnected (${reason}). Reconnecting in 10s...`);
    setTimeout(createBot, 10000);
  });

  bot.on('error', (err) => {
    console.log('❌ Error:', err.message);
  });
}

createBot();