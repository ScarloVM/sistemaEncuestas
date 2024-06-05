const {KafkaConfig} = require('./KafkaConfig.js');

class KafkaController {
    constructor(AppService) {
        this.kafkaConfig = new KafkaConfig();
        this.appService = AppService;
    }

    async conectarAEdicion(idEncuesta) {
        try {
            // Construye el objeto JSON con el mensaje y la marca de tiempo
            const message = [
                { 
                    value: JSON.stringify({
                        message: "Conectado a edicion",
                        time: new Date()
                    })
                }
            ];
            // Produce el mensaje en el topic
            await this.kafkaConfig.produceConexion('Edicion-Encuesta-'+idEncuesta, message);
    
            return "Se ha conectado a la edicion exitosamente";
        } catch(err) {
            console.log(err)
        }
    }
    

    async enviarCambioEncuesta(idEncuesta, cambio) {
        try {
            const message = [
                { value: JSON.stringify(cambio) }
            ];
            this.kafkaConfig.produceMensaje('Edicion-Encuesta-'+idEncuesta, message);
            this.appService.updateSurvey(idEncuesta, cambio);
            return "Se ha enviado el cambio exitosamente";
        }catch(err) {
            console.log(err)
        }
    }

    async consultarEstado(idEncuesta) {
        try {
            const message = this.kafkaConfig.consume('Edicion-Encuesta-'+idEncuesta);
            return message;
        }catch(err) {
            console.log(err)
        }
    }
}

module.exports.KafkaController = KafkaController;