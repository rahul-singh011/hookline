import { Queue } from "bullmq";
import redisConfig from "../config/redis.js";

const deliveryQueue = new Queue("webhook-delivery", {
  connection: redisConfig,

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 1000,
    },

    removeOnComplete: {
      count: 100,
    },

    removeOnFail: {
      count: 500,
    },
  },
})

deliveryQueue.on('error', (err)=>{
    console.error('BullMQ Queue error: ', err.message )
})

export default deliveryQueue