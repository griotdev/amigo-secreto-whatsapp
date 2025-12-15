const fs = require('fs');
const path = require('path');

const PARTICIPANTS_FILE = path.join(__dirname, '../../participantes.json');

class GameManager {
    constructor() {
        this.estado = 'FECHADO';
        this.listaTemporaria = [];
        this.idGrupoPermitido = null;
    }

    iniciar(chatId) {
        this.estado = 'ABERTO';
        this.listaTemporaria = [];
        this.idGrupoPermitido = chatId;
        this.saveParticipants();
    }

    finalizar() {
        this.estado = 'FECHADO';
        this.listaTemporaria = [];
        this.idGrupoPermitido = null;
        // Opcional: limpar arquivo ou manter último
        if (fs.existsSync(PARTICIPANTS_FILE)) {
            // fs.unlinkSync(PARTICIPANTS_FILE); 
        }
    }

    addParticipant(nome, numero, idSeguro, sugestoes, proxyContact = null, proxyName = null) {
        this.listaTemporaria.push({
            nome,
            numero,
            idSeguro,
            sugestoes,
            proxyContact,
            proxyName
        });
        this.saveParticipants();
    }

    isParticipant(idSeguro) {
        return this.listaTemporaria.some(p => p.idSeguro === idSeguro);
    }

    getParticipants() {
        return this.listaTemporaria;
    }

    saveParticipants() {
        fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(this.listaTemporaria, null, 2));
    }
}

module.exports = new GameManager();
