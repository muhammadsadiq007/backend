import mongoose, { Schema } from "mongoose";

 const payMethodSchema = new mongoose.Schema({
    paymethod: {type: String, required: true},
    details: {type: String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
 },{
   strictPopulate: false
 })
 export default payMethodSchema 