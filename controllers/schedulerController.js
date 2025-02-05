import clientSchema from "../models/Clients.js";
import mongoose, { Schema } from "mongoose";
import User from "../models/User.js";
// import getDynamicUserModel from "./helpers/dynamicModel"

export const clientScheduler = async() => {
    try {
        const user = await User.find({}, {networkname:1});
        const today = new Date()

        for (const network of user) {
            const { networkname } = network;

            const dbase = networkname + "_client"
            
            const Client = mongoose.model(dbase, clientSchema);
            const result = await Client.updateMany({
                rechargedate: {$lt: today },
                status: 'Active',
            },
                { $set:{status : 'In-Active'}}
        )
        }
    } catch (error) {
       
    }
}

export const unpaidScheduler = async() => {
    try {
        const user = await User.find({}, {networkname:1});
        const today = new Date()

        for (const network of user) {
            const { networkname } = network;

            const dbase = networkname + "_client"
            
            const Client = mongoose.model(dbase, clientSchema); 
            const result = await Client.updateMany({
                rechargedate: {$lt: today },
                status: 'Active',
            },
                { $set:{status : 'In-Active'}}
        )
        }
    } catch (error) {
       
    }
}