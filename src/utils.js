const fs = require('fs');
const path = require('path');

// Caminhos corretos (a partir da raiz do projeto, já que rodamos 'node index.js')
const LOG_FILE = path.join(__dirname, '../../resultado_log.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

function getChatId(message) {
    return message.fromMe ? message.to : message.from;
}

function getAuthorId(message, client) {
    if (message.fromMe) {
        return client.info.wid._serialized;
    }
    return message.author || message.from;
}

function saveResultLog(resultado) {
    const jsonString = JSON.stringify(resultado, null, 2);
    fs.writeFileSync(LOG_FILE, jsonString);
    console.log(`💾 Resultado salvo em '${LOG_FILE}'`);
}

function readResultLog() {
    if (!fs.existsSync(LOG_FILE)) return null;
    return JSON.parse(fs.readFileSync(LOG_FILE));
}

module.exports = {
    delay,
    getChatId,
    getAuthorId,
    saveResultLog,
    readResultLog
};
