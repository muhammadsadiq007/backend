import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required:true},
    networkname: {type: String, required:true},
    email: {type: String, unique:true ,required:true},
    password: {type: String,required:true},
    database : {type: String, default:"No"},
    isActive : {type: String, default:"Yes"},
    role: {type: String, enum: ["master", "admin", "employee"], required:true},
    permissions: {
        addclient: {type: Number, default: 0},
        editclient: {type: Number, default: 0},
        changepaydate: {type: Number, default: 0},
        changestatus:{type: Number, default: 0},
        clientlegder:{type: Number, default: 0},
        clientpayments:{type: Number, default: 0},
        paymentstatus:{type: Number, default: 0},
        deletepayment:{type: Number, default: 0},
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

const User = mongoose.model("user" , userSchema)

export default User;