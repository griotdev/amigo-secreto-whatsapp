const { getChatId } = require('../utils');

module.exports = {
    name: 'iniciar',
    async execute(message, client, gameManager) {
        if (gameManager.estado === 'ABERTO') {
            message.reply('❌ Já existe um Amigo Secreto rolando! Digite !finalizar para encerrar o atual.');
            return;
        }

        const chatId = getChatId(message);
        gameManager.iniciar(chatId);

        console.log(`Sorteio INICIADO no chat: ${chatId}`);

        await client.sendMessage(chatId, `🍫 *AMIGO CHOCOLATE DOS MALADOS!* 🍫
        
Para participar, responda aqui com:
*!participar 5543988888888 [Sua dica de presente]*

Exemplo:
_!participar 5543999998888 Gosto de Milka de Oreo (Não gosto de chocolate com fruta)_

(bot feito pelo André, deve tá uma bosta)`);
    }
};
