import mongoose, { Schema } from "mongoose";

 const packageSchema = new mongoose.Schema({
    package_name: {type: String, required: true, unique:true},
    package_price: {type: Number,required: true },
    package_type: {type: String,required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
 },{
   strictPopulate: false
 })
 export default packageSchema 