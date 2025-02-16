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
    console.log(`${result.modifiedCount} clients marked as Unpaid.`)
  } catch (error) {}
};

// export const unpaidScheduler = async () => {
//   try {
//     // Get current date
//     const currentDate = new Date();
//     const currentMonth =
//       currentDate.toLocaleString("default", { month: "long" }) +
//       " " +
//       currentDate.getFullYear();

//     // Calculate previous month
//     const previousDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() - 1
//     );
//     const previousMonth =
//       previousDate.toLocaleString("default", { month: "long" }) +
//       " " +
//       previousDate.getFullYear();

//     // Find clients who had a subscription in the previous month

//     const user = await User.find({ database: "Yes" }, { networkname: 1 });
//     for (const network of user) {
//       const { networkname } = network;

//       const Collection = mongoose.model(
//         networkname + "_collection",
//         collectionSchema
//       );
//       const previousMonthClients = await Collection.find({
//         "entries.month": previousMonth,
//       }).select("clientId");

//       // Extract client IDs from previous month
//       const clientIds = previousMonthClients.map((sub) => sub.clientId);
//       // Find clients who have NOT paid for the current month
//       const unpaidClients = await Collection.find({
//         $or: [
//           {
//             clientId: { $in: clientIds }, // Clients who had a subscription last month
//             "entries.month": { $ne: currentMonth },// But not in the current month
//           },
//           { entries : { $size: 0 }} //No Eentries at all
//         ],
//       }).select("clientId");

//       //   // Update status to "Unpaid" for these clients in net_client collection
//       const Client = mongoose.model(networkname + "_client", clientSchema);
//       const updatedClients = await Client.updateMany(
//         { _id: { $in: unpaidClients.map((c) => c.clientId) } },
//         { $set: { ispaid: "Unpaid" } }
//       );
//       console.log(`${updatedClients.modifiedCount} clients marked as Unpaid.`);
//     }
//   } catch (error) {
//   }
// };

export const unpaidScheduler = async () => {
  try {
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

    // Find users with database enabled
    const users = await User.find({ database: "Yes" }, { networkname: 1 });

    for (const network of users) {
      const { networkname } = network;

      // Get the collection for this network
      const Collection = mongoose.model(
        networkname + "_collection",
        collectionSchema
      );

      // 🔹 Find clients who paid in the previous month
      const previousMonthClients = await Collection.find({
        "entries.month": previousMonth,
      }).select("clientId");

      // Extract client IDs
      const clientIds = previousMonthClients.map((sub) => sub.clientId);

      // 🔹 Find unpaid clients (either missing current month OR empty entries)
      const unpaidClients = await Collection.find({
        $or: [
          { clientId: { $in: clientIds }, "entries.month": { $ne: currentMonth } }, // Paid last month but not this month
          { entries: { $size: 0 } }, // No entries at all
        ],
      }).select("clientId");

      // 🔹 Find all clients in net_client (including new ones)
      const Client = mongoose.model(networkname + "_client", clientSchema);
      const allClients = await Client.find().select("_id");

      // 🔹 Find new clients who are NOT in the Subscription collection
      const newClients = allClients.filter(
        (client) => !unpaidClients.some((c) => c.clientId.equals(client._id))
      );

      // 🔹 Check if new clients have paid for the current month
      const newUnpaidClients = [];
      for (const client of newClients) {
        const existingSubscription = await Collection.findOne({
          clientId: client._id,
          "entries.month": currentMonth, // Check if they paid this month
        });

        if (!existingSubscription) {
          newUnpaidClients.push(client._id);
        }
      }

      // 🔹 Merge both unpaid lists (old unpaid + new unpaid clients)
      const allUnpaidClientIds = [
        ...unpaidClients.map((c) => c.clientId),
        ...newUnpaidClients,
      ];

      // 🔹 Update all unpaid clients' status
      const updatedClients = await Client.updateMany(
        { _id: { $in: allUnpaidClientIds } },
        { $set: { ispaid: "Unpaid" } }
      );

      console.log(`${updatedClients.modifiedCount} clients marked as Unpaid.`);
    }
  } catch (error) {
    console.error("Error updating unpaid clients:", error);
  }
};



