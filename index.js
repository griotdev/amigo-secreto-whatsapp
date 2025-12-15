const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const client = require('./src/client');
const gameManager = require('./src/gameEnv');

// Carregar comandos dinamicamente
const commands = {};
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands[command.name] = command;
}

console.log(`📦 Comandos carregados: ${Object.keys(commands).join(', ')}`);

// --- EVENTOS DO BOT ---

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot Online e pronto para uso!');
    console.log(`👤 Logado como: ${client.info.pushname} (${client.info.wid.user})`);
});

// OUVINTE DE MENSAGENS (CÉREBRO DO BOT)
client.on('message_create', async (message) => {
    // Ignora mensagens vazias
    if (!message.body) return;

    // Roteador de Comandos
    const args = message.body.trim().split(/ +/);
    const commandName = args[0].toLowerCase().replace('!', ''); // Remove '!'

    // Verifica se é um comando conhecido (ex: !participar, !iniciar)
    if (message.body.startsWith('!') && commands[commandName]) {
        try {
            await commands[commandName].execute(message, client, gameManager);
        } catch (error) {
            console.error(`❌ Erro no comando ${commandName}:`, error);
            // message.reply('Ocorreu um erro ao executar este comando.');
        }
    }
});

// LIGA O BOT
client.initialize();