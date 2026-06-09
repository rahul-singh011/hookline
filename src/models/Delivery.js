import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  endpoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Endpoint",
    required: true,
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "success", "failed", "retrying"],
    default: "pending",
  },

  statusCode: {
    type: Number,
    default: null,
  },

  duration: {
    type: Number,
    default: null,
  },

  responseBody: {
    type: String,
    default: null,
  },

  attempt: {
    type: Number,
    default: 1,
  },

  errMessage: {
    type: String,
    default: null,
  },
},
{
    timestamps: true,
});

const Delivery = mongoose.model('Delivery', deliverySchema)

export default Delivery
