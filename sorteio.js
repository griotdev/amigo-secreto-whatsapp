function realizarSorteio(participantes) {
    // 1. Clonar o array para não alterar o original
    let lista = [...participantes];

    // 2. Embaralhar (Algoritmo Fisher-Yates simplificado)
    lista.sort(() => Math.random() - 0.5);

    let resultados = [];

    // 3. A Lógica do "Deslocamento"
    for (let i = 0; i < lista.length; i++) {
        let quemTira = lista[i];
        let quemRecebe;

        if (i === lista.length - 1) {
            // Se for o último da lista, tira o primeiro
            quemRecebe = lista[0];
        } else {
            // Se não, tira o próximo
            quemRecebe = lista[i + 1];
        }

        resultados.push({
            amigo: quemTira,
            destinatario: quemRecebe
        });
    }

    return resultados;
}

// OBRIGATÓRIO: Exporta a função para o index.js conseguir ler
module.exports = realizarSorteio;