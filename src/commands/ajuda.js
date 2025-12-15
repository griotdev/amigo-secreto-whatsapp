module.exports = {
    name: 'ajuda',
    async execute(message, client, gameManager) {
        // Ajuda funciona em qualquer lugar, não precisa de validação de chat
        const textoAjuda = `🤖 *COMANDOS DO AMIGO SECRETO* 🤖

🔹 *!iniciar*
Começa o jogo no grupo atual.

🔹 *!participar [Seu número] [Dica de presente]*
Entra no jogo (se estiver aberto).
Ex: *!participar 5511999998888 Gosta de livros*

🔹 *!adicionar <Numero> <Nome> & <Dica>*
Adiciona alguém manualmente.
Ex: *!adicionar 5511999998888 João & Gosta de Chá*

🔹 *!apadrinhar <Nome> & <Dica>*
Adiciona alguém sem Zap (Você recebe o resultado).
Ex: *!apadrinhar Vovó & Gosta de Flores*

🔹 *!lembrar*
O bot te manda seu amigo secreto no privado de novo.

🔹 *!finalizar*
Encerra o cadastro e realiza o sorteio (Só admin/quem iniciou).

💡 *Dica:* Use & para separar Nome de Dicas nos comandos de adicionar!`;

        await message.reply(textoAjuda);
    }
};
