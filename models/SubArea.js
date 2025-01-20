import mongoose, { Schema } from "mongoose";

export const subareaSchema = new mongoose.Schema({
  subarea: { type: String, required: true },
  subarea_name: { type: String, required: true },
  contact: { type: Number, required: true  },
  address: { type: String, required: true  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},{
  strictPopulate: false
});

export default subareaSchema;
