const mineflayer = require('mineflayer');
const http = require('http');
const { SocksProxyAgent } = require('socks-proxy-agent');

// Render Port Check
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AFK Bot via Proxy Active\n');
}).listen(PORT, () => {
  console.log(`🌐 Web listener running on port ${PORT}`);
});

const CONFIG = {
  host: 'play.battlepie.net',
  port: 25565,
  username: 'Sanya_Plays',
  password: 'Sanya0990',
  // Free SOCKS5 Proxy Node
  proxyHost: '138.68.60.8',
  proxyPort: 1080
};

function createBot() {
  console.log('🔄 Connecting through SOCKS5 Proxy to bypass firewall...');

  const proxyOptions = {
    host: CONFIG.proxyHost,
    port: CONFIG.proxyPort
  };

  const agent = new SocksProxyAgent(`socks5://${proxyOptions.host}:${proxyOptions.port}`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: '1.20.2',
    checkTimeoutInterval: 120000,
    connectTimeout: 60000,
    agent: agent
  });

  let loggedIn = false;

  bot.once('login', () => {
    console.log('⚡ Connected via Proxy! Entering game...');
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

  // Anti-AFK Jump
  setInterval(() => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 350);
    }
  }, 15000);

  bot.on('end', (reason) => {
    console.log(`⚠️ Disconnected (${reason}). Reconnecting in 10s...`);
    setTimeout(createBot, 10000);
  });

  bot.on('error', (err) => {
    console.log('❌ Proxy / Connection Error:', err.message);
  });
}

createBot();