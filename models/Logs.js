import mongoose, { Schema } from "mongoose";



const logsSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  action: { type: String, required: true },
  cmd: {type: String, required: true },
  target: { type: String, required: true },
  oldstatus:{ type: String, },
  newstatus:{ type: String, }, 
  targetId: { type: Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default logsSchema;