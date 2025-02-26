import mongoose, { Schema } from "mongoose";
import {DateTime} from "luxon";

 export const networkSchema = new mongoose.Schema({
    network_name : {type: String,  required: true},
    net_admin_name : {type: String,  required: true},
    net_admin_password : {type: String,  required: true},
    net_admin_email : {type: String,  required: true},
    net_admin_role : {type: String,  default: "employee"},
    net_admin_salary : {type: String,  default: "0"},
    createdAt: { type: Date, default: () => DateTime.now().setZone("Asia/Karachi").toFormat("yyyy-MM-dd HH:mm:ss") },
    updatedAt: { type: Date, default: () => DateTime.now().setZone("Asia/Karachi").toFormat("yyyy-MM-dd HH:mm:ss") },
});