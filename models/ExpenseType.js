import mongoose, { Schema } from "mongoose";

 const exptypeSchema = new mongoose.Schema({
    exptype: {type: String, required: true},
    details: {type: String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
 },{
   strictPopulate: false
 })
 export default exptypeSchema 