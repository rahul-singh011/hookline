
import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import endpointRoutes from './routes/endpoints.js'
import eventRoutes from './routes/events.js'
import deliveryRoutes from './routes/deliveries.js'
import billingRoutes from './routes/billing.js'
import authenticate from './middleware/authenticate.js'
import planLimits from './middleware/planLimits.js'
import setupBullBoard from './config/bullBoard.js'
import { generalLimiter, eventsLimiter, authLimiter } from './config/rateLimiter.js'


dotenv.config()

const app = express()


const serverAdapter = setupBullBoard()
app.use('/admin/queues' , serverAdapter.getRouter())

app.use('/billing/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

app.use(generalLimiter)

app.use('/auth', authLimiter, authRoutes)
app.use('/billing', billingRoutes) 

app.use('/endpoints', authenticate, endpointRoutes )
app.use('/events', authenticate,eventsLimiter, planLimits, eventRoutes )
app.use('/deliveries', authenticate, deliveryRoutes)  

app.get('/health', (req,res)=>{
    res.json({
        status: 'ok',
        project: 'HookLine',
        timestamp: new Date().toISOString()
    })
})

app.use((req,res)=>{
    res.status(404).json({error: 'Route not found'})
})

app.use((err, req, res ,next)=>{
    console.error(err.stack)
    res.status(err.status || 500).json({
        error : err.message || 'Internal server error'
    })
})

export default app