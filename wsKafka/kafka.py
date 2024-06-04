from confluent_kafka import Consumer, KafkaError, Producer

class Kafka:
    def __init__(self, bootstrap_servers):
        self.bootstrap_servers = bootstrap_servers

    def create_consumer(self, group_id, topics):
        consumer = Consumer({
            'bootstrap.servers': 'localhost:9092',
            'group.id': group_id,
            'auto.offset.reset': 'earliest'
        })

        consumer.subscribe(topics)

        return consumer

    def create_producer(self):
        producer = Producer({'bootstrap.servers': 'kafka1:19091,kafka2:19092,kafka3:19093'})
        return producer
    
    def create_topic(self, topic):
        producer = self.create_producer()
        producer.produce(topic, key="key", value="value")
        producer.flush()
        return "Topic created"