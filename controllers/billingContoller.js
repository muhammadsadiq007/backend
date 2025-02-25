import billingSchema from "../models/Billing.js";
import clientSchema from "../models/Clients.js";
import collectionSchema from "../models/Collection.js";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

export const generateMonthlyBills = async (req, res) => {
  try {
    const { userId, network_name } = req.body;
    const currentDate = new Date();
    const currentMonth =
      currentDate.toLocaleString("default", { month: "long" }) +
      " " +
      currentDate.getFullYear();

    // // 🟢 Check if billing entry already exists
    // const billExists = await Billing.findOne({
    //   "entries.month": currentMonth,
    // }).countDocuments();

    // if (billExists) {
    //   console.log(`⚠️ Bill for ${currentMonth} already exits`);
    //   return res.status(500).json({
    //     success: true,
    //     message: `⚠️ Bill for ${currentMonth} already exits`,
    //   });
    // }
    // Get all active clients without 0 Monthly Fees
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const activeClients = await Client.find({
      status: "Active",
      monthly: { $gt: 0 },
    });
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    for (const client of activeClients) {
      // Check if any bill exists for this client
      let previousBill = await Collection.find({
        clientId: client._id,
        "entries.month": currentMonth,
      }).countDocuments();
      
      console.log(previousBill)
      if (!previousBill) {
        const entries = {
          month: currentMonth,
        };
        console.log(client.internetid);
        // If no previous bill, generate only the current month bill
        const newBill = new Collection({
          clientId: client._id,
          internetid: client.internetid,
          name :client.name ,
          address : client.address,
          packageId : client.packageId,
          monthly: client.monthly, // user actual fees
          tvmonthly: client.tvmonthly,
          tvpackage: client.tvpackageId,
          subareaId: client.subareaId,
          status: "Unpaid",
          balance: client.balance,
          entries,
          userId,
        });

        console.log(`First-time bill created for ${newBill}}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bill has been generated successfully.`,
    });
  } catch (error) {
    console.log("Error generating bills:", error);
    return res.status(500).json({
      success: false,
      error: "Error generating bills",
    });
  }
};

export const getBillingSummary = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const summary = await Collection.aggregate([
      { $unwind: "$entries" }, // Har month ko separate row bana do
      {
        $match: {
          "entries.month": { $not: /^Days Amount$|^Other$/i } // ❌ Exclude "Days Amount" & "Other"
        }
      },
      {
        $group: {
          _id: "$entries", // Client ko unique rakhne ke liye group
          firstMonth: { $min: "$entries.month" }, // Pehli baar jis month me bill pay hua
          totalUsers: { $sum: 1 }, // Users count karna
        },
      },
      {
        $lookup: {
          from: "users", // Users collection ka naam
          localField: "_id", // Yeh userId match karega
          foreignField: "_id", // Users collection me _id se match karega
          as: "userInfo",
        },
      },

      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } }, // NULL handle karega agar user nahi mila
      {
        $addFields: {
          userName: { $ifNull: ["$userInfo.name", "System"] }, // ✅ Agar name na ho to "System" likho
        },
      },
      { $sort: { _id: 1 } }, // Months ko ascending order me sort karna
    ]);
  return res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("❌ Error fetching billing summary:", error);
    return res
      .status(500)
      .json({ success: false, error: "❌ Error fetching billing summary:" });
  }
};
