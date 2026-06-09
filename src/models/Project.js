
import mongoose from 'mongoose'
import crypto from 'crypto'

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    apiKey: {
        type: String,
        unique: true,
    },

    signingSecret: {
        type: String,
    },

    plan: {
        type: String,
        enum: ['free', 'pro', 'business'],
        default: 'free'
    },

    monthlyUsage: {
        type: Number,
        default: 0
    },

    monthlyLimit: {
        type: Number,
        default: 1000 // for free plan
    },

    isActive: {
        type: Boolean,
        default: true, 
    },
},
{
    timestamps: true,
})

projectSchema.pre('save', async function () {
    if (!this.apiKey) {
      this.apiKey = 'hl_' + crypto.randomBytes(24).toString('hex')
    }
    if (!this.signingSecret) {
      this.signingSecret = crypto.randomBytes(32).toString('hex')
    }

  })

const Project = mongoose.model('Project', projectSchema)

export default Project;