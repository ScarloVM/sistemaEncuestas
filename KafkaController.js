const {KafkaConfig} = require('./KafkaConfig.js');

class KafkaController {
    constructor(AppService) {
        this.kafkaConfig = new KafkaConfig();
        this.appService = AppService;
    }

    async conectarAEdicion(idEncuesta) {
        try {
            const message = [
                { value: 'Conectado a edicion' }
            ];
            this.kafkaConfig.produce('Edicion-Encuesta-'+idEncuesta, message);

            return "Se ha conectado a la edicion exitosamente";
        }catch(err) {
            console.log(err)
        }
    }

    async enviarCambioEncuesta(idEncuesta, cambio) {
        try {
            const message = [
                { value: JSON.stringify(cambio) }
            ];
            this.kafkaConfig.produce('Edicion-Encuesta-'+idEncuesta, message);
            this.appService.updateSurvey(idEncuesta, cambio);
            return "Se ha enviado el cambio exitosamente";
        }catch(err) {
            console.log(err)
        }
    }

    async consultarEstado(idEncuesta) {
        try {
            
        }catch(err) {
            console.log(err)
        }
    }
}

module.exports.KafkaController = KafkaController;