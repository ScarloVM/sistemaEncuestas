const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'my-app', //Cambiar por cookie o id de usuario
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

const runProducer = async () => {
    await producer.connect();
    await producer.send({
        topic: 'test-topic',
        messages: [
            { value: 'Hello KafkaJS user!' },
        ],
    });

    await producer.disconnect();
};

runProducer().catch(console.error);

const consumer = kafka.consumer({ groupId: 'test-group' });

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString(),
            });
        },
    });
}

runConsumer().catch(console.error);
