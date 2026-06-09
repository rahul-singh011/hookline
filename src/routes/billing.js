
import express from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import authenticate from '../middleware/authenticate.js'
import Project from '../models/Project.js'
import {PLANS, getPlan} from '../config/plans.js'


const router = express.Router()

const getRazorpay = () => {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }

router.get('/plans', (req,res)=>{
    res.json({plans: PLANS})
})

router.post('/order', authenticate, async (req,res , next)=>{
    try{
        const {plan} = req.body

        if(!plan || !PLANS[plan]){
            return res.status(400).json({
                error: 'Invalid plan, Choose: pro or business',
            })
        }

        if(plan === 'free'){
            return res.status(400).json({
                error: 'Cannot purchase free plan'
            })
        }

        if(req.project.plan === plan){
            return res.status(400).json({
                error: `You are already on the ${plan} plan`
            })
        }

        const planConfig = getPlan(plan)

        const order = await getRazorpay().orders.create({
            amount: planConfig.razorpayAmount,
            currency: 'INR',
            receipt: `order_${req.project._id}_${plan}`,

            notes: {
                projectId: req.project._id.toString(),
                plan: plan,
                projectName: req.project.name,
            },
        })

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            plan: planConfig,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        })
    }catch(err){
        next(err)
    }
})

router.post('/verify', authenticate , async (req ,res, next)=>{
    try{
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan
        } = req.body

        if(!razorpay_order_id ||  !razorpay_payment_id  || !razorpay_signature){
            return res.status(400).json({
                error: 'Missing payment verification feilds.'
            })
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id
        const expectedSignature = crypto
          .createHmac('sha256' , process.env.RAZORPAY_KEY_SECRET)
          .update(body)
          .digest('hex')

    if(expectedSignature !== razorpay_signature){
        return res.status(400).json({
            error: 'Invalid payment signature'
        })
    }

    const planConfig = getPlan(plan)

    await Project.findByIdAndUpdate(req.project._id, {
        plan: plan,
        monthlyLimit: planConfig.monthlyLimit,
      })

      res.json({
        message: `Successfully upgraded to ${planConfig.name} plan`,
        plan: plan,
        monthlyLimit: planConfig.monthlyLimit,
      })

    }catch(err){
        next(err)
    }
})

router.post('/webhook', express.raw({ type: 'application/json' }), async (req,res,next)=>{
    try{
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
        const signature = req.headers['x-razorpay-signature']

        const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }

    const event = JSON.parse(req.body)

   
    if (event.event === 'payment.captured') {
      const notes = event.payload.payment.entity.notes

      const projectId = notes.projectId
      const plan = notes.plan

      if (projectId && plan) {
        const planConfig = getPlan(plan)

        await Project.findByIdAndUpdate(projectId, {
          plan: plan,
          monthlyLimit: planConfig.monthlyLimit,
        })

        console.log(`Plan upgraded: project ${projectId} → ${plan}`)
      }
    }

    res.json({received: true})
    }catch(err){
        console.error('Webhook error: ', err.message)
        res.status(400).json({ error: 'Webhook processing failed'})

    }

})

router.get('/usage' , authenticate, async (req,res,next)=>{
    const {plan, monthlyUsage, monthlyLimit} = req.project

    res.json({
        plan,
        used: monthlyUsage,
        limit: monthlyLimit,
        remaining: monthlyLimit- monthlyUsage,
        percentUsed: Math.round((monthlyUsage / monthlyLimit) * 100),
    })
})

export default router