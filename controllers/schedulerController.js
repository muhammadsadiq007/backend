import clientSchema from "../models/Clients.js";
import mongoose, { Schema } from "mongoose";
import User from "../models/User.js";
import collectionSchema from "../models/Collection.js";

export const clientScheduler = async () => {
  try {
    const user = await User.find({ database: "Yes" }, { networkname: 1 });
    const today = new Date();

    for (const network of user) {
      const { networkname } = network;

      const dbase = networkname + "_client";

      const Client = mongoose.model(dbase, clientSchema);
      const result = await Client.updateMany(
        {
          rechargedate: { $lt: today },
          status: "Active",
        },
        { $set: { status: "In-Active", ispaid: "Unpaid" } }
      );
    }
  } catch (error) {}
};

export const unpaidScheduler = async () => {
  try {
    // Get current date
    const currentDate = new Date();
    const currentMonth =
      currentDate.toLocaleString("default", { month: "long" }) +
      " " +
      currentDate.getFullYear();

    // Calculate previous month
    const previousDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1
    );
    const previousMonth =
      previousDate.toLocaleString("default", { month: "long" }) +
      " " +
      previousDate.getFullYear();

    // Find clients who had a subscription in the previous month

    const user = await User.find({ database: "Yes" }, { networkname: 1 });
    for (const network of user) {
      const { networkname } = network;

      const Collection = mongoose.model(
        networkname + "_collection",
        collectionSchema
      );
      const previousMonthClients = await Collection.find({
        "entries.month": previousMonth,
      }).select("clientId");

      // Extract client IDs from previous month
      const clientIds = previousMonthClients.map((sub) => sub.clientId);
      // Find clients who have NOT paid for the current month
      const unpaidClients = await Collection.find({
        $or: [
          {
            clientId: { $in: clientIds }, // Clients who had a subscription last month
            "entries.month": { $ne: currentMonth },// But not in the current month
          },
          { entries : { $size: 0 }} //No Eentries at all
        ],
      }).select("clientId");

      //   // Update status to "Unpaid" for these clients in net_client collection
      const Client = mongoose.model(networkname + "_client", clientSchema);
      const updatedClients = await Client.updateMany(
        { _id: { $in: unpaidClients.map((c) => c.clientId) } },
        { $set: { ispaid: "Unpaid" } }
      );
      // console.log(`${updatedClients.modifiedCount} clients marked as Unpaid.`);
    }
  } catch (error) {
  }
};
