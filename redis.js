const redis = require('redis');

class RedisClient {
    constructor(host, port) {
        this.client = redis.createClient({ url: `redis://${host}:${port}`});
        this.connect();
    }


    async connect() {
        try {
            await this.client.connect();
            console.log('Connected REDISMIERDA');
        } catch (e) {
            console.error(`Failed to connect to REDISMIERDA: ${e}`);
        }
    }

    async disconnect() {
        this.client.quit();
    }

    set(key, value) {
        this.client.set(key, value, redis.print);
    }

    get(key, callback) {
        this.client.get(key, callback);
    }
}

module.exports.RedisClient = RedisClient;
