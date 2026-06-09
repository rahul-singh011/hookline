import { Worker } from "bullmq";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import redisConfig from "../config/redis.js";
import { deliverWebHook } from "../services/deliveryService.js";
import Delivery from "../models/Delivery.js";
import Endpoint from "../models/Endpoint.js";
import Event from "../models/Event.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Worker: MongoDb connected ");
  } catch (err) {
    console.error("Worker: MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const processDelivery = async (job) => {
  const {
    deliveryId,
    eventId,
    endpointId,
    endpointUrl,
    payload,
    eventType,
    signingSecret,
  } = job.data;

  console.log(`Processing job ${job.id} → ${endpointUrl}`);

  const result = await deliverWebHook({
    endpointUrl,
    payload,
    eventType,
    eventId,
    deliveryId,
    signingSecret,
  });

  await Delivery.findByIdAndUpdate(deliveryId, {
    status: result.success ? "success" : "failed",
    statusCode: result.statusCode,
    duration: result.duration,
    responseBody: result.responseBody,
    errorMessage: result.errorMessage,
    attempt: job.attemptsMade + 1,
  });

  if (result.success) {
    await Endpoint.findByIdAndUpdate(endpointId, {
      consecutiveFailures: 0,
      lastSuccessAt: new Date(),
    });

    await Event.findByIdAndUpdate(eventId, {
      status: "delivered",
    });

    console.log(
      `✓ Delivered job ${job.id} → ${endpointUrl} (${result.duration}ms)`,
    );
  } else {
    const endpoint = await Endpoint.findByIdAndUpdate(
      endpointId,
      { $inc: { consecutiveFailures: 1 } },
      { returnDocument: 'after' }
    )
    if (endpoint.consecutiveFailures >= 10) {
      await Endpoint.findByIdAndUpdate(endpointId, { isActive: false });
      console.log(
        `⚡ Circuit breaker triggered → endpoint ${endpointId} paused`,
      );
    }

    console.log(
      `✗ Failed job ${job.id} → ${endpointUrl} (${result.errorMessage || result.statusCode})`,
    );
    throw new Error(result.errorMessage || `HTTP ${result.statusCode}`);
  }
};

const createWorker = async () => {
  await connectDB();

  const worker = new Worker("webhook-delivery", processDelivery, {
    connection: redisConfig,
    concurrency: 5,
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.log(`Job ${job.id} failed permanently: ${err.message}`);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err.message);
  });

  console.log("HookLine Worker started — waiting for jobs...");

  return worker;
};

export { createWorker };
