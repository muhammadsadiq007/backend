import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required:true},
    networkname: {type: String, required:true},
    email: {type: String, unique:true ,required:true},
    password: {type: String,required:true},
    role: {type: String, enum: ["master", "admin", "employee"], required:true},
    createAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
})

const User = mongoose.model("user" , userSchema)

export default User;