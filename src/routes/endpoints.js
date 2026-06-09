import express from 'express'
import Endpoint from '../models/Endpoint.js'

const router = express.Router()

router.post('/', async (req, res, next)=>{
    try{
        const {url , description} = req.body

        if(!url || url.trim() === ''){
            return res.status(400).json({error: 'URL is required'})
        }

        try{
            new URL(url)
        }catch{
            return res.status(400).json({error: 'Invalid url format'})
        }

        const endpoint = await Endpoint.create({
            project: req.project._id,
            url,
            description: description || '',
          })
        
        res.status(201).json({
            message: 'Endpoint registered successfully',
            endpoint,
          })
    }catch(err){
        next(err)
    }
})

// listing all the endpoints

router.get('/', async (req, res, next) =>{
    try{
        const endpoints = await Endpoint.find({
            project: req.project._id,
        }).sort({ createdAt: -1 }) 

        res.json({
            count: endpoints.length,
            endpoints
        })
    }catch(err){
        next(err)
    }
})

// Removing the endpoint

router.delete('/:id', async (req,res,next)=>{
    try{
        const endpoint = await Endpoint.findOneAndDelete({
            _id: req.params.id,
            project: req.project._id,
          })
        if(!endpoint) {
            return res.status(404).json({error: 'Endpoint not found'})
        }

        res.json({message: "Endpoints deleted successfully"})
    }catch(err){
        next(err)
    }
})

// Pause or Resume the endpoint

router.patch('/:id/toogle', async (req,res,next)=>{
    try{
        const endpoint = await Endpoint.findOne({
            _id: req.params.id,
            project: req.project._id
        })

        if(!endpoint){
            return res.status(404).json({error: 'Endpoint not found'})
        }

        endpoint.isActive = !endpoint.isActive
        await endpoint.save()

        res.json({
            message: `Endpoint ${endpoint.isActive ? 'resumed' : 'paused'} successfully`,
            endpoint,
        })

    }catch(err){
        next(err)
    }
})

export default router