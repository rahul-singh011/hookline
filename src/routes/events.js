import express from 'express'
import Event from '../models/Event.js'
import Endpoint from '../models/Endpoint.js'
import Delivery from '../models/Delivery.js'
import deliveryQueue from '../queues/deliveryQueue.js'

const router = express.Router()

router.post('/', async (req,res,next)=>{
    try{
        const {eventType, payload} = req.body

        if(!eventType || eventType.trim() === ''){
            return res.status(400).json({error: 'eventType is required'})
        }

        if(!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return res.status(400).json({error: 'payload must be a json object'})
        }

        if(req.project.monthlyUsage >= req.project.monthlyLimit){
            return res.status(429).json({
                error: 'Monthly event limit reached. Please upgrade your plan.',
                limit: req.project.monthlyLimit,
                used: req.project.monthlyUsage,
            })
        }

        const event = await Event.create({
            project: req.project._id,
            eventType,
            payload,
            status: 'pending',
        })

        const endpoints = await Endpoint.find({
            project: req.project._id,
            isActive: true,
        })

        if(endpoints.length === 0){
            return res.status(202).json({
                message: 'Event accepted. No active endpoints registered yet.',
                eventId: event._id,
                queuedFor: 0
            })
        }

        await Promise.all(
            endpoints.map(async (endpoint)=>{
                const delivery = await Delivery.create({
                    event: event._id,
                    endpoint: endpoint._id,
                    project: req.project._id,
                    status: 'pending',
                    attempt: 1
                })
                await deliveryQueue.add(
                    'deliver', {
                        deliveryId: delivery._id.toString(),
                        eventId: event._id.toString(),
                        endpointId: endpoint._id.toString(),
                        endpointUrl: endpoint.url,
                        payload: event.payload,
                        eventType: event.eventType,
                        signingSecret: req.project.signingSecret,
                    }
                )
            })
        )
        await req.project.updateOne({$inc: {monthlyUsage: 1}})

        res.status(202).json({
            message: 'Event accepted and queued for delivery',
            eventId: event._id,
            queuedFor: endpoints.length,
        })
    }catch(err){
        next(err)
    }
})

export default router