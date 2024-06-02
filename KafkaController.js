import {KafkaConfig} from './KafkaConfig.js';

const sendMessageToKafka = async (req, res) => {
    try {
        const {message} = req.body;
        const kafkaConfig = new KafkaConfig();
        const messages = [
            { key: 'key1', value: message }
        ]
        kafkaConfig.produce('test', messages);

        res.status(200).json({
            status: 'success',
            message: 'Message sent to Kafka'
        });
    }catch(err) {
        console.log(err)
    }
};

const controllers = {
    sendMessageToKafka
};

module.exports.controllers = controllers;