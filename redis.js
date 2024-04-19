const redis = require('redis');

class RedisClient {
    constructor(host, port) {
        this.client = redis.createClient({ url: `redis://${host}:${port}`});
        this.connect();
    }


    async connect() {
        try {
            await this.client.connect();
            console.log('Connected REDIS');
        } catch (e) {
            console.error(`Failed to connect to REDIS: ${e}`);
        }
    }

    async disconnect() {
        this.client.quit();
    }

    set(key, value) {
        this.client.set(key, value, redis.print);
    }

    get(key) {
        return this.client.get(key, redis.print);
    }

    del(key) {
        this.client.del(key, redis.print);
    }

    expire(key, seconds) {
        this.client.expire(key, seconds, redis.print);
    }
}

module.exports.RedisClient = RedisClient;
