const { getAuthorId, readResultLog, delay } = require('../utils');

module.exports = {
    name: 'lembrar',
    async execute(message, client, gameManager) {
        try {
            const log = readResultLog();
            if (!log) return;

            const idAutor = getAuthorId(message, client);
            console.log(`🔍 !lembrar solicitado por ID: ${idAutor}`);

            const parEncontrado = log.find(par => {
                if (par.amigo.idSeguro && par.amigo.idSeguro === idAutor) {
                    return true;
                }
                const quemMandouNum = idAutor.replace(/[^0-9]/g, '');
                const numeroSalvo = par.amigo.numero.replace(/[^0-9]/g, '');
                return quemMandouNum.slice(-8) === numeroSalvo.slice(-8);
            });

            if (parEncontrado) {
                const dica = parEncontrado.destinatario.sugestoes || "Sem dica.";
                const textoLembrete = `🤫 Psiu! Você tirou: *${parEncontrado.destinatario.nome}*
💡 Dica: _${dica}_`;

                const msgEnviada = await client.sendMessage(idAutor, textoLembrete);
                message.reply("📩 Enviei no seu privado! Dá uma olhada.");

                if (idAutor !== client.info.wid._serialized) {
                    await delay(1000);
                    try {
                        await msgEnviada.delete(false);
                        console.log(`🗑️ Lembrete apagado do chat do Admin.`);
                    } catch (e) {
                        console.log(`⚠️ Erro ao apagar lembrete:`, e.message);
                    }
                } else {
                    console.log(`👀 Lembrete mantido (Admin pediu o próprio).`);
                }

            } else {
                message.reply("Não encontrei você no último sorteio.");
            }

        } catch (e) {
            console.error(e);
        }
    }
};
