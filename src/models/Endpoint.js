import mongoose from 'mongoose'

const endpointSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    url: {
        type: String,
        required: true,
        trim: true,
    },

    // Human Readable label
    description: {
        type: String,
        trim: true,
        default: '',
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    consecutiveFailures: {
        type: Number,
        default: 0,
    },

    lastSuccessAt: {
        type: Date,
        default: null,
    },
},
{
    timestamps: true,
})

const Endpoint = mongoose.model('Endpoint', endpointSchema)

export default Endpoint