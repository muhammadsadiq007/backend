import billingSchema from "../models/Billing.js";
import clientSchema from "../models/Clients.js";
import collectionSchema from "../models/Collection.js";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import packageSchema from "../models/Packages.js";

export const generateMonthlyBills = async (req, res) => {
  const { userId, network_name, monthyear } = req.body;
  const currentDate = new Date(monthyear);
  const currentMonth =
    currentDate.toLocaleString("default", { month: "long" }) +
    " " +
    currentDate.getFullYear();
  const previousDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1
  );
  const previousMonth =
    previousDate.toLocaleString("default", { month: "long" }) +
    " " +
    previousDate.getFullYear();
  try {
  const Package = mongoose.model(network_name + "_packages", packageSchema);
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const activeClients = await Client.find({
    status: "Active",
    monthly: { $gt: 0 },
  }).populate({
    path: "packageId",
    select: "package_name",
    model: Package,
  })
  
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    for (const client of activeClients) {
      // Check if any bill exists for this client
      let previousBill = await Collection.find({
        clientId: client._id,
        "entries.month": currentMonth,
        monthly: { $gt: 0 },
      })
      if (previousBill.length < 1) {
        const entries = {
          month: currentMonth,
        };
        let oldBillBal = await Collection.find({
          clientId: client._id,
          "entries.month": previousMonth,
          monthly: { $gt: 0 },
        })
          let newBalance = previousBill && previousBill.status === "Unpaid" ? client?.monthly + client?.tvmonthly : 0;
    
    
        // If no previous bill, generate only the current month bill
        const newBill = new Collection({
          clientId: client._id,
          internetid: client.internetid,
          name :client.name ,
          address : client.address,
          packageId: client.packageId.package_name,
          monthly: client.monthly, // user actual fees
          subareaId: client.subareaId,
          status: "Pending",
          balance: parseInt(client.balance) + parseInt(newBalance),
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

export const tvMonthlyBills = async (req, res) => {
  const { userId, network_name, monthyear } = req.body;
  const currentDate = new Date(monthyear);
  const currentMonth =
    currentDate.toLocaleString("default", { month: "long" }) +
    " " +
    currentDate.getFullYear();
  const previousDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1
  );
  const previousMonth =
    previousDate.toLocaleString("default", { month: "long" }) +
    " " +
    previousDate.getFullYear();
  try {
  const Package = mongoose.model(network_name + "_packages", packageSchema);
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const activeClients = await Client.find({
    status: "Active",
    tvmonthly: { $gt: 0 },
  }).populate({
    path: "tvpackageId",
    select: "package_name",
    model: Package,
  })
  
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    for (const client of activeClients) {
      // Check if any bill exists for this client
      let previousBill = await Collection.find({
        clientId: client._id,
        "entries.month": currentMonth,
      })
      if (previousBill.length < 1) {
        const entries = {
          month: currentMonth,
        };

        let oldBillBal = await Collection.find({
          clientId: client._id,
          tvmonthly: { $gt: 0 },
          "entries.month": previousMonth,
        })
          let newBalance = previousBill && previousBill.status === "Unpaid" ? client.tvmonthly : 0;
        // If no previous bill, generate only the current month bill
        const newBill = new Collection({
          clientId: client._id,
          internetid: client.internetid,
          name :client.name ,
          address : client.address,
          tvmonthly: client.tvmonthly,
          tvpackage: client.tvpackageId.package_name,
          subareaId: client.subareaId,
          status: "Pending",
          balance: parseInt(client.balance) + parseInt(newBalance),
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
          "entries.month": { $not: /^Days Amount$|^Other$/i }, // ❌ Exclude "Days Amount" & "Other"
        },
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
