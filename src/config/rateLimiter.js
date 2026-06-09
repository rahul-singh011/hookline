
import rateLimit from 'express-rate-limit'


export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,

    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again after 15 minutes'
    }
})

export const eventsLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        error: 'Event rate limit exceeded, Max 60 events per minutes.'
    }
})

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many projects created, Please try again later.'
    }
})

