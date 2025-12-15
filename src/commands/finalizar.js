const { getChatId, delay, saveResultLog } = require('../utils');
const realizarSorteio = require('../sorteio'); // Caminho atualizado

module.exports = {
    name: 'finalizar',
    async execute(message, client, gameManager) {
        if (getChatId(message) !== gameManager.idGrupoPermitido) return;

        const participantes = gameManager.getParticipants();

        if (participantes.length < 2) {
            message.reply("❌ Precisa de pelo menos 2 pessoas para sortear!");
            return;
        }

        message.reply(`🎲 *Sorteio Encerrado!* Processando ${participantes.length} participantes... 
Os resultados serão enviados no privado! 🤫`);

        // 1. Sorteio
        const resultado = realizarSorteio(participantes);
        saveResultLog(resultado);

        // 2. Envio
        for (let par of resultado) {
            const numeroSalvo = par.amigo.numero;
            const dicaPresente = par.destinatario.sugestoes;

            console.log(`\nTentando enviar para: ${par.amigo.nome}...`);

            try {
                // Tenta usar o ID Seguro (LID)
                let idParaEnvio = par.amigo.idSeguro;

                if (!idParaEnvio) {
                    // Fallback
                    const contatoZap = await client.getNumberId(numeroSalvo);
                    if (contatoZap) {
                        idParaEnvio = contatoZap._serialized;
                    } else {
                        idParaEnvio = numeroSalvo + "@c.us";
                    }
                }

                if (idParaEnvio) {
                    const texto = `🎅 Olá ${par.amigo.nome}!
                    
O seu Amigo Secreto é: *${par.destinatario.nome}* 🎁

💡 *Dica de Presente:*
_${dicaPresente}_`;

                    const msgEnviada = await client.sendMessage(idParaEnvio, texto);
                    console.log(`✅ Enviado para ${par.amigo.nome}`);

                    await delay(1000);

                    // Verifica se é o Admin (ID do cliente)
                    // Importante: comparar strings serializadas
                    if (idParaEnvio !== client.info.wid._serialized) {
                        try {
                            await msgEnviada.delete(false);
                            console.log(`🗑️ Mensagem apagada do chat do Admin.`);
                        } catch (e) { console.log(`⚠️ Não deu pra apagar.`); }
                    } else {
                        const nomeAdmin = client.info.pushname || "Admin";
                        console.log(`👀 Mensagem mantida (${nomeAdmin} recebeu o próprio resultado).`);
                    }

                    await delay(2000);
                }
            } catch (err) {
                console.error(`❌ Falha envio: ${err.message}`);
            }
        }

        await client.sendMessage(gameManager.idGrupoPermitido, "✅ *Todos os amigos secretos foram enviados!* Verifiquem seus privados. (Se alguém não recebeu, digite !lembrar aqui)");

        gameManager.finalizar();
    }
};
