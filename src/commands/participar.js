const { getChatId, getAuthorId } = require('../utils');
const fs = require('fs'); // gameManager already handles saving but we might need for other things? No, gameManager handles.

module.exports = {
    name: 'participar',
    async execute(message, client, gameManager) {
        // Valida se é o grupo certo
        const chatId = getChatId(message);
        if (chatId !== gameManager.idGrupoPermitido) return;

        // --- 1. Identificação ---
        const idAutor = getAuthorId(message, client);
        let nome = "Participante";

        if (message.fromMe) {
            nome = client.info.pushname || "Admin";
        } else if (message._data && message._data.notifyName) {
            nome = message._data.notifyName;
        }

        let numeroPuro = idAutor.replace(/\D/g, '');

        // --- 2. Validação ---
        let numeroValido = false;
        if (numeroPuro.length >= 12 && numeroPuro.length <= 13) {
            numeroValido = true;
        } else {
            // Lógica de fallback de regex manual
            const matchNoTexto = message.body.match(/55[0-9]{10,11}/);
            if (matchNoTexto) {
                numeroPuro = matchNoTexto[0];
                numeroValido = true;
                console.log(`✅ Número manual encontrado: ${numeroPuro}`);
            } else {
                console.log(`⚠️ ID Automático falhou/LID (${numeroPuro}). Tentando ler do texto...`);
            }
        }

        if (!numeroValido) {
            message.reply(`⚠️ Não consegui identificar seu número automaticamente.
            
Por favor, tente de novo DIGITANDO SEU NÚMERO junto com a dica.
Exemplo:
*!participar 5543999998888 Gosto de Livros*`);
            return;
        }

        // --- 3. Cadastro ---
        if (gameManager.isParticipant(idAutor)) {
            message.reply(`Ei ${nome}, você já está na lista!`);
        } else {
            // Remove comando e número
            let dica = message.body.replace('!participar', '').replace(numeroPuro, '').trim();
            if (!dica) dica = "Sem dica cadastrada.";

            gameManager.addParticipant(nome, numeroPuro, idAutor, dica);

            console.log(`➕ Novo participante: ${nome} (Num: ${numeroPuro} | ID: ${idAutor})`);
            message.react('✅');
        }
    }
};
