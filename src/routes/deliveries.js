import express from "express";
import Delivery from "../models/Delivery.js";
import Event from "../models/Event.js";
import Endpoint from "../models/Endpoint.js";
import deliveryQueue from "../queues/deliveryQueue.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { eventId, endpointId, status, limit } = req.query;
    const filter = { project: req.project._id };

    if (eventId) filter.event = eventId;
    if (endpointId) filter.endpoint = endpointId;
    if (status) filter.status = status;

    const limitNum = Math.min(parseInt(limit) || 20, 100);

    const deliveries = await Delivery.find(filter)

      .populate("event", "eventType status payload createdAt")
      .populate("endpoint", "url description")
      .sort({ createdAt: -1 })
      .limit(limitNum);

    res.json({
      count: deliveries.length,
      deliveries,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      project: req.project._id,
    })
      .populate("event", "eventType status payload createdAt")
      .populate("endpoint", "url description isActive");

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    res.json({ delivery });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/replay", async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      project: req.project._id,
    });

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    if (delivery.status !== "failed") {
      return res.status(400).json({
        error: `Cannot replay a delivery with status '${delivery.status}'. Only failed deliveries can be replayed.`,
      });
    }

    const event = await Event.findById(delivery.event);
    if (!event) {
      return res.status(404).json({ error: "Original event not found" });
    }

    const endpoint = await Endpoint.findById(delivery.endpoint)
    if(!endpoint) {
        return res.dtatsu(404).json({error: 'Endpoint not found'})
    }
    if(!endpoint.isActive){
        return res.status(400).json({
            error: 'Cannot replay to a paused endpoint. Resume the endpoint first.'
        })
    }

    const project = req.project
    
    const newDelivery = await Delivery.create({
        event: event._id,
        endpoint: endpoint._id,
        project: project._id,
        status: 'pending',
        attempt: 1,
    })

    await deliveryQueue.add('deliver', {
        deliveryId: newDelivery._id.toString(),
        eventId:       event._id.toString(),
        endpointId:    endpoint._id.toString(),
        endpointUrl:   endpoint.url,
        payload:       event.payload,
        eventType:     event.eventType,
        signingSecret: project.signingSecret,
    })

    res.status(202).json({
        message: 'Delivery queued for replay',
        originalDeliveryId: delivery._id,
        newDeliveryId: newDelivery._id,
        eventType: event.eventType,
        endpointUrl: endpoint.url,
      })
  } catch (err) {
    next(err);
  }
});

export default router