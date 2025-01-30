import mongoose, { Schema } from "mongoose";
import collectionSchema from "../models/Collection.js";
import jwt from "jsonwebtoken";
import subareaSchema from "../models/SubArea.js";
import clientSchema from "../models/Clients.js";

export const renewClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  
  try {
    const { id } = req.params;
  const { 
    internetid,
    name,
    address,
    packageId,
    monthly, // user actual fees
    paymentmethod,
    paymentdate,
    subareaId,
    paidby,
    amountpaid, //user actual amount paid
    } = req.body;

    let today = new Date(); // Aaj ki date
    let currentMonth = today.getMonth(); // Current month index (0-based)
    let currentYear = today.getFullYear(); // Current year
    let currentDate = today.getDate(); // Aaj ki tareekh

    let newExpiryDate;

    if (currentDate <= 10) {
        // ✅ Agar aaj ki date 10 ya us se pehle hai, to isi month ki 10 par set karein
        newExpiryDate = new Date(currentYear, currentMonth, 10);
    } else {
        // ✅ Agar aaj 10 se zyada hai, to next month ki 10 par set karein
        let nextMonth = (currentMonth + 1) % 12;
        let nextYear = currentYear + (nextMonth === 0 ? 1 : 0); // Agar next month January ho to year +1
        newExpiryDate = new Date(nextYear, nextMonth, 10);
    }

    // ✅ Client ki expiry date update karein
    
    console.log(newExpiryDate)
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const newPay = new Collection({
      clientId: id,
      internetid,
      name,
      address,
      packageId,
      monthly, // user actual fees
      paymentmethod,
      paymentdate: new Date(paymentdate).toLocaleString(), 
      subareaId,
      paidby,
      amountpaid, //how much user paid
      
    });
   
    await newPay.save();
    const Client = mongoose.model(network_name + "_client", clientSchema);
    await Client.findByIdAndUpdate(
      { _id: id },
      {
        status: "Active",
        ispaid: "Paid",
        rechargedate: newExpiryDate,
      }
    );
    return res
    .status(200)
    .json({ success: true, message: `${internetid} Payment Added Successfully` });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Server Error",
    });
  }


};

export const statusUnpaid = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const { id } = req.params;
  const { status, rechargedate, clientId, amountpaid, monthspaid } = req.body;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const legder = await Collection.findByIdAndUpdate(
      { _id: id },
      {
        status: status,
      }
    );
    const today = new Date(rechargedate);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() - monthspaid, 10);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    await Client.findOneAndUpdate(
      { internetid: clientId },
      {
        balance: -parseInt(amountpaid),
        ispaid: "Unpaid",
        status: "In-Active",
        rechargedate: new Date(nextMonth).toLocaleDateString(),
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "successfully change" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const statusPaid = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const { id } = req.params;
  const { status, rechargedate, clientId, amountpaid ,monthspaid } = req.body;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const legder = await Collection.findByIdAndUpdate(
      { _id: id },
      {
        status: status,
      }
    );
    const today = new Date(rechargedate);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + monthspaid, 10);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    await Client.findOneAndUpdate(
      {  internetid: clientId },
      {
        balance: +parseInt(amountpaid),
        ispaid: "Paid",
        status: "Active",
        rechargedate: new Date(nextMonth).toLocaleDateString(),
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "successfully change" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const getLegder = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const { id } = req.params;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const legder = await Collection.find({ clientId: id })
      .populate({ path: "subareaId", model: network_name + "_subarea" })
      .populate({ path: "clientId", model: network_name + "_client" });
    return res.status(200).json({ success: true, legder });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const getCollection = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const { id } = req.params;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const collection = await Collection.findById(id)
      .populate({ path: "subareaId", model: SubArea })
      .populate({ path: "clientId", model: Client });
    return res.status(200).json({ success: true, collection });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const getCollections = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clientsCollection = await Collection.find()
      .sort({ createdAt: -1 })
      .populate({ path: "clientId", select: "rechargedate", model: Client });
    return res.status(200).json({ success: true, clientsCollection });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const addCollection = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const { id } = req.params;

  try {
    const {
      internetid,
      name,
      address,
      packageId,
      monthly, // user actual fees
      monthspaid,
      paymentmethod,
      paymentdate,
      rechargedate,
      paytype,
      subareaId,
      paidby,
      amountpaid, //user actual amount paid
      balance, // user previous balanace
    } = req.body;

       // Calculate the Start Date
    const startDate = new Date();
    const entries = [];

    // Advance Payments
    if(paytype === "advance") {
    for (let i = 0; i < monthspaid; i++) {
      const monthDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() +1 + i
      );
      const entry = {
        month:
          monthDate.toLocaleString("default", { month: "long" }) +
          " " +
          monthDate.getFullYear(),
      };
      entries.push(entry);
    }
    const today = new Date(rechargedate);
    const newExpiryDate = new Date(
      today.getFullYear(),
      today.getMonth() + parseInt(monthspaid),
      10
    );
  }

    //Genrate monthly entries
    if(paytype === "monthly") {
    for (let i = 0; i < monthspaid; i++) {
      const monthDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i
      );
      const entry = {
        month:
          monthDate.toLocaleString("default", { month: "long" }) +
          " " +
          monthDate.getFullYear(),
      };
      entries.push(entry);
    }
    const today = new Date(rechargedate);
    const newExpiryDate = new Date(
      today.getFullYear(),
      today.getMonth() + parseInt(monthspaid),
      10
    );
  }
    const payableamount = parseInt(monthly) * parseInt(monthspaid) + parseInt(balance)
    const totalBalance = payableamount - parseInt(amountpaid);

    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );


    const Client = mongoose.model(network_name + "_client", clientSchema);

    const ifPaid = await Collection.find({
      clientId:id, "entries.month" : {$in : entries.map((e) => e.month)},
    }).countDocuments();
    if (ifPaid) {
      return res.status(500).json({
        success: false,
        error: `${internetid} has already paid this month fees`,
      });
    }
    const newPay = new Collection({
      clientId: id,
      internetid,
      name,
      address,
      packageId,
      monthly, // user actual fees
      amountpaid, //how much user paid
      monthspaid, // NO of month 
      paymentmethod,
      paymentdate: new Date(paymentdate).toLocaleString(), 
      subareaId,
      paidby,
      balance, // user previous balanace
      entries,
    });
    await newPay.save();
    await Client.findByIdAndUpdate(
      { _id: id },
      {
        balance: totalBalance,
        status: "Active",
        ispaid: "Paid",
        rechargedate: new Date(newExpiryDate).toLocaleDateString(),
      }
    );
    return res
      .status(200)
      .json({ success: true, message: `${internetid} Payment Added Successfully` });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Payment Server Error",
    });
  }
};
