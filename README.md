# 🎅 Amigo Secreto WhatsApp Bot

Bot de WhatsApp para organizar e sortear Amigo Secreto de forma automática, divertida e inclusiva. Ideal para grupos de família e amigos.

## ✨ Funcionalidades

- **Sorteio Automático**: Realiza o sorteio e envia o resultado no privado de cada um.
- **Suporte a Offline**: Permite adicionar participantes que não estão no grupo ou não têm WhatsApp (`!adicionar`).
- **Sistema de Padrinhos**: Permite que alguém receba o resultado por outra pessoa (ex: Vovó que não tem celular) (`!apadrinhar`).
- **Dicas de Presente**: Participantes podem cadastrar o que gostariam de ganhar (`& Dicas`).
- **Validação de Números**: Verifica se os números cadastrados realmente existem no WhatsApp.

## 🚀 Instalação e Uso

1. **Pré-requisitos**:
   - Node.js instalado.
   - Uma conta de WhatsApp conectada no celular.

2. **Instalação**:
   ```bash
   npm install
   ```

3. **Iniciando o Bot**:
   ```bash
   node index.js
   ```
   - Escaneie o QR Code que aparecerá no terminal com o seu WhatsApp.

## 🤖 Comandos

### Gestão do Jogo
- **`!iniciar`**: Inicia um novo jogo no grupo atual.
- **`!finalizar`**: Encerra as inscrições, realiza o sorteio e envia os resultados.
- **`!ajuda`**: Mostra a lista de comandos.

### Participação
- **`!participar [Seu número] [Dica]`**: Para entrar no jogo.
  - Ex: `!participar 5511999998888 Gosto de Livros`

- **`!adicionar <Numero> <Nome> & <Dica>`**: Cadastra alguém manualmente.
  - Ex: `!adicionar 5511999998888 João Silva & Gosta de Vinhos`

- **`!apadrinhar <Nome> & <Dica>`**: Cadastra alguém sem WhatsApp, o resultado chega para QUEM ENVIOU o comando.
  - Ex: `!apadrinhar Vovó Maria & Gosta de Flores`
  - *Opção Avançada*: `!apadrinhar <NumeroPadrinho> <Nome> & <Dica>` (O resultado vai para o número do padrinho especificado).

- **`!lembrar`**: O bot reenvia seu resultado no privado (caso tenha esquecido).

### Extras
- **`!maria`**: Um comando especial de carinho.

## 🛠️ Estrutura do Projeto

- `index.js`: Ponto de entrada e gerenciamento de mensagens.
- `src/commands/`: Lógica de cada comando.
- `src/gameEnv.js`: Gerenciamento do estado do jogo e lista de participantes.

---
Feito com ❤️ por André.
