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
            console.log(`🔍 Dados: ${JSON.stringify(par.amigo)}`); // DEBUG EXTRA

            try {
                // Tenta usar o ID Seguro (LID) ou Proxy
                let idParaEnvio = par.amigo.idSeguro;
                let ehProxy = false;

                // Detecta se é um usuário Proxy (pelo ID gerado em apadrinhar.js)
                if (par.amigo.idSeguro.startsWith('proxy_')) {
                    ehProxy = true;
                    if (par.amigo.proxyContact) {
                        idParaEnvio = par.amigo.proxyContact;
                        console.log(`🔀 Redirecionando envio de ${par.amigo.nome} para o Padrinho/Proxy (${idParaEnvio})`);
                    } else {
                        console.error(`⚠️ USUÁRIO PROXY (${par.amigo.nome}) SEM CONTATO DE PADRINHO! Ignorando envio.`);
                        continue; // Pula este usuário para não travar o loop
                    }
                } else if (par.amigo.proxyContact) {
                    idParaEnvio = par.amigo.proxyContact;
                    ehProxy = true;
                    console.log(`🔀 Redirecionando envio de ${par.amigo.nome} para o Padrinho/Proxy (${idParaEnvio})`);
                }

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
                    // Check de segurança para evitar crashes
                    if (!idParaEnvio.endsWith('@c.us') && !idParaEnvio.endsWith('@lid')) {
                        console.error(`❌ ID Inválido detectado para ${par.amigo.nome}: ${idParaEnvio}. Pulando para evitar crash.`);
                        continue;
                    }

                    let texto;

                    if (ehProxy) {
                        texto = `🎅 Olá! Você está recebendo esta mensagem como PADRINHO de *${par.amigo.nome}*!
                    
O Amigo Secreto de ${par.amigo.nome} é: *${par.destinatario.nome}* 🎁

💡 *Dica de Presente de ${par.destinatario.nome}:*
_${dicaPresente}_

⚠️ *Importante:* Por favor, entregue este resultado para ${par.amigo.nome} em segredo!`;
                    } else {
                        texto = `🎅 Olá ${par.amigo.nome}!
                    
O seu Amigo Secreto é: *${par.destinatario.nome}* 🎁

💡 *Dica de Presente:*
_${dicaPresente}_`;
                    }

                    console.log(`🚀 Enviando para ${idParaEnvio} (LID/Proxy validado)...`); // LOG EXTRA
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
                } else {
                    console.log(`❌ Não encontrei ID para envio de: ${par.amigo.nome} (Num: ${numeroSalvo})`);
                }
            } catch (err) {
                console.error(`❌ ERRO CRÍTICO no envio para ${par.amigo.nome}:`, err);
            }
        }

        await client.sendMessage(gameManager.idGrupoPermitido, "✅ *Todos os amigos secretos foram enviados!* Verifiquem seus privados. (Se alguém não recebeu, digite !lembrar aqui)");

        gameManager.finalizar();
    }
};
