const { Kafka } = require('kafkajs');


class KafkaService {
    constructor(clientId, host) {
        this.clientId = clientId;
        this.brokers = [`${host}:9092`]; //localhost:9092
        this.kafka = new Kafka({
            clientId: this.clientId,
            brokers: [`${host}:9092`]
        });
    }

    async createSession(SurveyId) {
        const producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
            topic: 'EditSurvey'+ SurveyId,
            messages: [
                { value: '' },
            ],
        });
        producer.disconnect();
        return 'Session created';
    }

    async createConsumer(groupId) {
        const consumer = this.kafka.consumer({ groupId: groupId });
        await consumer.connect();
        return consumer;
    }
}

module.exports.KafkaService = KafkaService;