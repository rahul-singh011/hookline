
import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    eventType: {
        type: String,
        required: true,
        trim: true,
      },
    
      payload: {
        type: Object,
        required: true,
      },

      status: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'partial'],
        default: 'pending',
      },
},
{
    timestamps: true
})

const Event = mongoose.model('Event', eventSchema)

export default Event
