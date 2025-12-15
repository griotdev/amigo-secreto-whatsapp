const { getChatId, getAuthorId } = require('../utils');

module.exports = {
    name: 'apadrinhar',
    async execute(message, client, gameManager) {
        // Valida se é o grupo certo
        const chatId = getChatId(message);
        if (chatId !== gameManager.idGrupoPermitido) return;

        const { getAuthorId } = require('../utils'); // Ensure getAuthorId is available
        // Formato: !apadrinhar <numero_do_padrinho> <Nome do Afilhado>
        // OU:      !apadrinhar <Nome do Afilhado> (quem enviou a mensagem é o padrinho)
        const args = message.body.trim().split(/ +/);

        // Remove o comando em si
        args.shift();

        if (args.length < 1) {
            message.reply('⚠️ Formato inválido! Use: *!apadrinhar <numero_do_padrinho> <Nome do Afilhado>* OU *!apadrinhar <Nome do Afilhado>*');
            return;
        }

        const arg1 = args[0];
        let nomeAfilhado;
        let proxyContactId;
        let numeroDisplay;

        // Verifica se o primeiro argumento parece um número de telefone (BR: 12 ou 13 digitos)
        const numeroLimpo = arg1.replace(/\D/g, '');
        const pareceNumero = numeroLimpo.length >= 12 && numeroLimpo.length <= 13;

        if (pareceNumero) {
            // Modo: !apadrinhar <numero> <nome>
            const numeroPadrinho = numeroLimpo;
            nomeAfilhado = args.slice(1).join(' '); // args[0] é o número, então o nome começa em args[1]

            if (!nomeAfilhado) {
                message.reply('⚠️ Faltou o nome do afilhado! Use: *!apadrinhar <numero> <nome>*');
                return;
            }

            message.reply(`🔄 Verificando número do Padrinho (${numeroPadrinho})...`);
            try {
                const contactId = await client.getNumberId(numeroPadrinho);
                if (!contactId) {
                    message.reply(`❌ O número ${numeroPadrinho} não parece ter WhatsApp registrado.`);
                    return;
                }
                proxyContactId = contactId._serialized;
                numeroDisplay = numeroPadrinho;
            } catch (e) {
                console.error(e);
                message.reply('❌ Erro ao validar número do Padrinho.');
                return;
            }
        } else {
            // Modo: !apadrinhar <nome> (Padrinho é quem enviou)
            nomeAfilhado = args.join(' '); // args[0] já é parte do nome

            if (args.length < 1) { // This check is technically redundant due to the initial args.length < 1 check, but good for clarity
                message.reply('⚠️ Use: *!apadrinhar <numero> <nome>* OU *!apadrinhar <nome>* (você será o padrinho)');
                return;
            }

            // Pega ID de quem mandou o comando
            proxyContactId = getAuthorId(message, client);
            numeroDisplay = "Você (Remetente)";
        }

        // Gera ID único para o Afilhado
        const idSeguroAfilhado = `proxy_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        if (gameManager.isParticipant(idSeguroAfilhado)) {
            message.reply('⚠️ Erro interno de ID. Tente novamente.');
            return;
        }

        const dica = "Participante Apadrinhado (recebe via Padrinho)";

        // O "numero" do afilhado é fictício ou irrelevante, mas passamos algo para constar
        // Passamos o contato do padrinho no campo extra 'proxyContact'

        // (nome, numero, idSeguro, sugestoes, proxyContact, proxyName)
        gameManager.addParticipant(
            nomeAfilhado,
            "00000000000", // Número fictício
            idSeguroAfilhado,
            dica,
            proxyContactId, // O ID real onde a mensagem chegará
            "Padrinho" // Nome genérico ou poderíamos buscar se o padrinho já estiver cadastrado
        );

        console.log(`➕ Participante Apadrinhado: ${nomeAfilhado} (Via: ${proxyContactId})`);
        message.reply(`✅ *${nomeAfilhado}* foi cadastrado(a)!
💌 O resultado dele(a) será enviado para: ${numeroDisplay}.`);
    }
};
