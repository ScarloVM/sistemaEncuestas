const { Kafka, logLevel } = require('kafkajs');


class KafkaConfig {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'my-app',
            brokers: ['kafka1:19091','kafka2:19092','kafka3:19093'],
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: 'test-group' });
    }


    async produceConexion(topic, messages) {
        try {

            await this.producer.connect();
            await this.producer.send({
                topic: topic,
                messages: messages
            })
            console.log('Producing message:', messages);
        }catch(err) {
            console.log("Error in producing message", err);
        }finally{
            await this.producer.disconnect();
        }
    }


    async produceMensaje(topic, messages) {
        try {
            await this.producer.connect();
            const parsedValue = JSON.parse(messages[0].value);
            parsedValue.time = new Date();
            const updateValue = JSON.stringify(parsedValue);
            messages[0].value = updateValue;
            console.log('Producing message:', messages);
            await this.producer.send({
                topic: topic,
                messages: messages
            })
        }catch(err) {
            console.log("Error in producing message", err);
        }finally{
            await this.producer.disconnect();
        }
    }


    async consume(topic) {
        var tiempoFinal; // Variable para almacenar el último tiempo

        
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topic: topic });
    
            await new Promise((resolve, reject) => {
                let timeoutId;
                this.consumer.run({
                    eachMessage: async ({ topic, partition, message }) => {
                        const value = message.value.toString();
                        try {
                            const parsedMessage = JSON.parse(value);
                            // Verifica si el mensaje contiene los campos esperados
                            if (parsedMessage.emailCreador || parsedMessage.message) {
                                // Verifica si el mensaje contiene la propiedad 'time'
                                if (parsedMessage.time) {
                                    console.log('Mensaje recibido:', parsedMessage.time);
                                    tiempoFinal = parsedMessage.time;
                                }
                            } else {
                                console.log('El mensaje no tiene la estructura esperada. Saltando al siguiente mensaje.');
                            }
    
                            // Reinicia el temporizador cada vez que se recibe un mensaje
                            clearTimeout(timeoutId);
                            timeoutId = setTimeout(() => resolve(), 1000); // 1 segundo de espera sin mensajes
                        } catch (err) {
                            console.log('Error parsing message as JSON. Skipping message:', err);
                        }
                    }
                });
    
                // Temporizador para resolver la promesa en caso de no recibir más mensajes
                timeoutId = setTimeout(() => resolve(), 5000); // 5 segundos de espera total sin mensajes
            });
            await this.consumer.seek({ topic: topic, partition: 0, offset: 0 });
            console.log("viva messi", tiempoFinal);
            return `Mensaje recibido: ${tiempoFinal}`;
        } catch (err) {
            console.log("Error en la consumición del mensaje:", err);
        }
    }
    



}

module.exports.KafkaConfig = KafkaConfig;