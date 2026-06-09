
import express from 'express'
import Project from '../models/Project.js'

const router = express.Router()

router.post('/projects', async (req,res,next)=>{
    try{
        const {name} = req.body

        if(!name || name.trim() === ''){
            return res.status(400).json({error : 'Project name is required'})
        }
        const project = await Project.create({name})

        res.status(201).json({
            message: 'Project created successfully',
            project: {
                id: project._id,
                name: project.name,
                apiKey: project.apiKey,
                signingSecret: project.signingSecret,
                plan: project.plan,
                monthlyLimit: project.monthlyLimit
            },
        })
    } catch(err){
        next(err)
    }
})

export default router