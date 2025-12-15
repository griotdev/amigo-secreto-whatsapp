const { getChatId } = require('../utils');

module.exports = {
    name: 'maria',
    async execute(message, client, gameManager) {
        const chatId = getChatId(message);
        if (chatId !== gameManager.idGrupoPermitido) return;

        await client.sendMessage(chatId, 'eu não fico um dia sem pensar em você, minha bonitinha.');
    }
}