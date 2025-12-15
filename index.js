const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const realizarSorteio = require('./sorteio');

// 1. CRIA O BOT (CLIENTE)
const client = new Client({
    authStrategy: new LocalAuth()
});

// --- VARIÁVEIS DE ESTADO (MEMÓRIA RAM) ---
let estado = 'FECHADO'; // Pode ser: 'FECHADO', 'ABERTO'
let listaTemporaria = [];
let idGrupoPermitido = null;

// --- FUNÇÕES AUXILIARES ---

// Função de delay (espera)
const delay = ms => new Promise(res => setTimeout(res, ms));

// Helper: Identifica o ID do Chat (Funciona pra quem manda e pro Admin/Bot)
function getChatId(message) {
    // Se fui eu que mandei (fromMe), o chat é o 'to'. Se foi outro, é 'from'.
    return message.fromMe ? message.to : message.from;
}

// Helper: Identifica o ID do Autor (Funciona pra quem manda e pro Admin/Bot)
function getAuthorId(message) {
    if (message.fromMe) {
        // Se o bot/admin enviou, pega o ID do cliente logado
        return client.info.wid._serialized;
    }
    // Em grupos, 'author' é quem mandou. No privado, é 'from'.
    return message.author || message.from;
}

// Função para salvar Log de resultados
function salvarLog(resultado) {
    const jsonString = JSON.stringify(resultado, null, 2);
    fs.writeFileSync('./resultado_log.json', jsonString);
    console.log("💾 Resultado salvo em 'resultado_log.json'");
}

// --- EVENTOS DO BOT ---

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot Online e pronto para uso!');
});

// OUVINTE DE MENSAGENS (CÉREBRO DO BOT)
client.on('message_create', async (message) => {

    // Ignora mensagens vazias ou de sistema
    if (!message.body) return;

    // ======================================================
    // COMANDO 1: INICIAR (O "Admin" manda no grupo)
    // ======================================================
    if (message.body === '!iniciar') {
        if (estado === 'ABERTO') {
            message.reply('❌ Já existe um Amigo Secreto rolando! Digite !finalizar para encerrar o atual.');
            return;
        }

        estado = 'ABERTO';
        listaTemporaria = []; // Zera a lista
        idGrupoPermitido = getChatId(message); // Trava o bot neste chat

        console.log(`Sorteio INICIADO no chat: ${idGrupoPermitido}`);

        await client.sendMessage(idGrupoPermitido, `🎄 *AMIGO SECRETO INICIADO!* 🎄
        
Para participar, responda aqui com:
*!participar 5543SEUNUMERO [Sua dica de presente]*

Exemplo:
_!participar 5543999998888 Gosto de livros e chocolate_

(Quando todos entrarem, digite *!finalizar*)`);
    }

    // ======================================================
    // COMANDO 2: PARTICIPAR (Versão com Plano B Manual)
    // ======================================================
    if (message.body.toLowerCase().startsWith('!participar') && estado === 'ABERTO') {

        // Valida se é o grupo certo
        if (getChatId(message) !== idGrupoPermitido) return;

        // --- 1. Tenta identificar AUTOMATICAMENTE ---
        let idAutor = getAuthorId(message);
        let nome = "Participante";

        if (message.fromMe) {
            nome = "André";
        } else if (message._data && message._data.notifyName) {
            nome = message._data.notifyName;
        }

        // Limpa o ID para pegar só dígitos
        let numeroPuro = idAutor.replace(/\D/g, '');

        // --- 2. VALIDAÇÃO E PLANO B ---

        // Um número BR válido tem entre 12 e 13 dígitos (55 + 2 DDD + 8 ou 9 numero)
        // Se vier aquele "LID" de 14 dígitos ou mais, consideramos inválido para envio.
        let numeroValido = false;

        if (numeroPuro.length >= 12 && numeroPuro.length <= 13) {
            numeroValido = true;
        } else {
            console.log(`⚠️ ID Automático falhou/LID (${numeroPuro}). Tentando ler do texto...`);

            // Tenta achar um número escrito na mensagem pelo usuário
            // Regex procura: "55" seguido de 10 ou 11 digitos
            const matchNoTexto = message.body.match(/55[0-9]{10,11}/);

            if (matchNoTexto) {
                numeroPuro = matchNoTexto[0]; // Pega o número que a pessoa digitou
                numeroValido = true;
                console.log(`✅ Número manual encontrado: ${numeroPuro}`);
            }
        }

        // --- 3. DECISÃO ---
        if (!numeroValido) {
            // Se falhou automático E a pessoa não digitou, pede pra ela digitar
            message.reply(`⚠️ Não consegui identificar seu número automaticamente (Culpa do WhatsApp!).
            
Por favor, tente de novo DIGITANDO SEU NÚMERO junto com a dica.
Exemplo:
*!participar 5543999998888 Gosto de Livros*`);
            return; // Para tudo e espera a pessoa tentar de novo
        }

        // --- 4. CADASTRO ---
        // Se chegou aqui, temos um "numeroPuro" válido (seja automático ou manual)

        const jaEstaNaLista = listaTemporaria.some(p => p.numero === numeroPuro);

        if (jaEstaNaLista) {
            message.reply(`Ei ${nome}, você já está na lista!`);
        } else {
            // Remove o comando e o número da dica, deixando só o texto
            // Ex: "!participar 5543... Dica" -> vira só "Dica"
            let dica = message.body.replace('!participar', '').replace(numeroPuro, '').trim();
            if (!dica) dica = "Sem dica cadastrada.";

            listaTemporaria.push({
                nome: nome,
                numero: numeroPuro,
                sugestoes: dica
            });

            fs.writeFileSync('./participantes.json', JSON.stringify(listaTemporaria, null, 2));

            console.log(`➕ Novo participante: ${nome} (Num: ${numeroPuro})`);
            message.react('✅');
        }
    }

    // ======================================================
    // COMANDO 3: FINALIZAR (O "Admin" manda)
    // ======================================================
    if (message.body === '!finalizar' && estado === 'ABERTO') {
        if (getChatId(message) !== idGrupoPermitido) return;

        if (listaTemporaria.length < 2) {
            message.reply("❌ Precisa de pelo menos 2 pessoas para sortear!");
            return;
        }

        message.reply(`🎲 *Sorteio Encerrado!* Processando ${listaTemporaria.length} participantes... 
Os resultados serão enviados no privado! 🤫`);

        // 1. Realiza o sorteio
        const resultado = realizarSorteio(listaTemporaria);
        salvarLog(resultado);

        // 2. Envia no privado (Com Auto-Delete para o Admin)
        for (let par of resultado) {
            const numeroSalvo = par.amigo.numero;
            const dicaPresente = par.destinatario.sugestoes;

            // Log no terminal continua (não mostra o segredo, só que enviou)
            console.log(`\nTentando enviar para: ${par.amigo.nome}...`);

            try {
                let idParaEnvio = null;

                // Tenta pegar o ID
                const contatoZap = await client.getNumberId(numeroSalvo);
                if (contatoZap) {
                    idParaEnvio = contatoZap._serialized;
                } else {
                    idParaEnvio = numeroSalvo + "@c.us";
                }

                if (idParaEnvio) {
                    const texto = `🎅 Olá ${par.amigo.nome}!
                    
O seu Amigo Secreto é: *${par.destinatario.nome}* 🎁

💡 *Dica de Presente:*
_${dicaPresente}_`;

                    // 1. CAPTURA A MENSAGEM NESSA VARIÁVEL
                    const msgEnviada = await client.sendMessage(idParaEnvio, texto);

                    console.log(`✅ Enviado para ${par.amigo.nome}`);

                    // 2. ESPERA UM POUCO (Segurança para não bugar o envio)
                    await delay(1000);

                    // 3. APAGA SÓ PARA VOCÊ (Se não for você mesmo)
                    // Se o destinatário for o próprio bot (Admin), NÃO apaga, senão ele não vê o resultado dele.
                    if (idParaEnvio !== client.info.wid._serialized) {
                        try {
                            await msgEnviada.delete(false); // false = Apaga só pra mim (Sender)
                            console.log(`🗑️ Mensagem apagada do chat do Admin.`);
                        } catch (e) {
                            console.log(`⚠️ Não deu pra apagar (mas foi enviada).`);
                        }
                    } else {
                        console.log(`👀 Mensagem mantida (André recebeu o próprio resultado).`);
                    }

                    await delay(2000); // Espera pro próximo
                }

            } catch (err) {
                console.error(`❌ FALHA CRÍTICA ao enviar para ${par.amigo.nome}:`, err.message);
            }
        }

        await client.sendMessage(idGrupoPermitido, "✅ *Todos os amigos secretos foram enviados!* Verifiquem seus privados. (Se alguém não recebeu, digite !lembrar aqui)");

        // RESET FINAL
        estado = 'FECHADO';
        idGrupoPermitido = null;
        listaTemporaria = [];
    }

    // ======================================================
    // COMANDO 4: LEMBRAR (Para os esquecidos)
    // ======================================================
    if (message.body === '!lembrar') {
        try {
            if (!fs.existsSync('./resultado_log.json')) return;

            const log = JSON.parse(fs.readFileSync('./resultado_log.json'));

            const idAutor = getAuthorId(message);
            const quemMandou = idAutor.replace(/[^0-9]/g, '');

            const parEncontrado = log.find(par => {
                const numeroSalvo = par.amigo.numero.replace(/[^0-9]/g, '');
                // Compara os últimos 8 dígitos (Ignora o 9 e DDD para evitar erro)
                return quemMandou.slice(-8) === numeroSalvo.slice(-8);
            });

            if (parEncontrado) {
                const dica = parEncontrado.destinatario.sugestoes || "Sem dica.";

                // Responde no privado para não vazar no grupo (reply manda onde foi chamado)
                // Se quiser garantir privado, use client.sendMessage com o ID do remetente
                const textoLembrete = `🤫 Psiu! Você tirou: *${parEncontrado.destinatario.nome}*
💡 Dica: _${dica}_`;

                // Tenta mandar no privado
                await client.sendMessage(idAutor, textoLembrete);
                message.reply("📩 Enviei no seu privado! Dá uma olhada.");
            } else {
                message.reply("Não encontrei você no último sorteio.");
            }

        } catch (e) {
            console.error(e);
        }
    }
});

// LIGA O BOT (Sempre por último)
client.initialize();