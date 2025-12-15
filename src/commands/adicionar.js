const { getChatId } = require('../utils');

module.exports = {
    name: 'adicionar',
    async execute(message, client, gameManager) {
        // Valida se é o grupo certo
        const chatId = getChatId(message);
        if (chatId !== gameManager.idGrupoPermitido) return;

        // Formato: !adicionar 5511999999999 Nome da Pessoa
        const args = message.body.trim().split(/ +/);

        if (args.length < 3) {
            message.reply('⚠️ Formato inválido! Use: *!adicionar 5511999999999 Nome da Pessoa*');
            return;
        }

        const numeroInput = args[1].replace(/\D/g, '');
        const nomeParticipante = args.slice(2).join(' ');

        // Validação básica de número BR (55 + 2 DDD + 8/9 digitos) = 12 ou 13
        if (numeroInput.length < 12 || numeroInput.length > 13) {
            message.reply('⚠️ Número parece inválido. Certifique-se de usar 55 + DDD + Número (ex: 5511999998888).');
            return;
        }

        // Validação real no WhatsApp
        message.reply("🔄 Verificando número no WhatsApp...");

        let idSeguro;
        try {
            const contactId = await client.getNumberId(numeroInput);
            if (!contactId) {
                message.reply(`❌ O número ${numeroInput} não parece ter WhatsApp registrado.`);
                return;
            }
            idSeguro = contactId._serialized;
        } catch (error) {
            console.error(error);
            message.reply("❌ Erro ao verificar número. Tente de novo.");
            return;
        }

        if (gameManager.isParticipant(idSeguro)) {
            message.reply(`⚠️ O número ${numeroInput} já está na lista!`);
            return;
        }

        // Adiciona sem dicas por enquanto
        const dica = "Participante Offline (adicionado manualmente)";

        // Usa o idSeguro validado que termina em @c.us
        gameManager.addParticipant(nomeParticipante, numeroInput, idSeguro, dica);

        console.log(`➕ Participante Offline: ${nomeParticipante} (Num: ${numeroInput} | ID: ${idSeguro})`);
        message.reply(`✅ *${nomeParticipante}* foi adicionado(a) com ID validado!`);
    }
};
