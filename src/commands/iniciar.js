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

        await client.sendMessage(chatId, `🍫 *AMIGO SECRETO INICIADO!* 🍫

📜 *Como Participar:*

1️⃣ *Para você mesmo:*
Digita: *!participar [Seu número] [Dica de presente]*
Exemplo: _!participar 5511999998888 Gosta de livros_

2️⃣ *Adicionar alguém offline:*
Digita: *!adicionar [Número da Pessoa] [Nome da Pessoa] & [Dica]*
Exemplo: _!adicionar 5511999998888 João & Gosta de Chá_
(Adiciona alguém que não está no grupo ou está offline)

3️⃣ *Apadrinhar alguém (Sem WhatsApp):*
Digita: *!apadrinhar [Nome da Pessoa] & [Dica]*
Exemplo: _!apadrinhar Vovó Maria & Gosta de Flores_
(Você recebe o resultado por ela)
Ou: *!apadrinhar 5511...8888 Vovó Maria & Dica* (Outra pessoa recebe)

📢 *Quando todos estiverem cadastrados, digite !finalizar*`);
    }
};
