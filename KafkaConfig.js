const { Kafka, logLevel } = require('kafkajs');


class KafkaConfig {
    constructor() {
        this.kafka = new Kafka({
            clientId: 'my-app',
            brokers: ['localhost:9091'],
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: 'test-group' });
    }

    async produce(topic, messages) {
        try {
            await this.producer.connect();
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

    async consume(topic, callback) {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topic: topic, fromBeginning: true });
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const value = message.value.toString();
                    callback(value);
                }
            })
        }catch(err) {
            console.log("Error in consuming message", err);
        }
    }


    // async createSession(SurveyId) {
    //     const producer = this.kafka.producer();
    //     while (true) {
    //         try {
    //             await producer.connect();
    //             break;
    //         } catch (err) {
    //             console.log('Error connecting producer!', err);
    //             if (err instanceof KafkaJSNonRetriableError && err.name === 'KafkaJSNumberOfRetriesExceeded') {
    //             console.log('retrying connection...');
    //             continue; 
    //             }
    //             console.error('unknown error ' + err);
    //             break;
    //         }
    //     } 
    //     await producer.send({
    //         topic: 'EditSurvey'+ SurveyId,
    //         messages: [
    //             { value: 'a' },
    //         ],
    //     });
    //     producer.disconnect();
    //     return 'Session created';
    // }

    // async createConsumer(groupId) {
    //     const consumer = this.kafka.consumer({ groupId: groupId });
    //     await consumer.connect();
    //     return consumer;
    // }
}

module.exports.KafkaConfig = KafkaConfig;