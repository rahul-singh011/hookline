
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,

    maxRetriesRequest: null,
}

export default redisConfig