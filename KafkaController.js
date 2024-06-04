const {KafkaConfig} = require('./KafkaConfig.js');

class KafkaController {
    constructor(AppService) {
        this.kafkaConfig = new KafkaConfig();
        this.appService = AppService;
    }

    async conectarAEdicion(idEncuesta) {
        try {
            console.log(idEncuesta)
            this.kafkaConfig.produce('Edicion-Encuenta-'+idEncuesta, 'Inicio de edicion de encuesta');

            return "Se ha conectado a la edicion exitosamente";
        }catch(err) {
            console.log(err)
        }
    }

    async enviarCambioEncuesta(idEncuesta, cambio) {
        try {
            this.kafkaConfig.produce('Edicion-Encuentas-'+idEncuesta, message);
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