import mongoose, { Schema } from "mongoose";
import collectionSchema from "../models/Collection.js";
import jwt from "jsonwebtoken";
import subareaSchema from "../models/SubArea.js";
import clientSchema from "../models/Clients.js";

export const statusUnpaid = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const { id } = req.params;
  const { status, rechargedate, clientId, monthly } = req.body;
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
    const nextMonth = new Date(today.getFullYear(), today.getMonth() - 1, 10);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const updclient = await Client.findByIdAndUpdate(
      { _id: clientId },
      {
        balance: -parseInt(monthly),
        ispaid: "Unpaid",
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
  const { status, rechargedate, clientId, monthly } = req.body;
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
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 10);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const updclient = await Client.findByIdAndUpdate(
      { _id: clientId },
      {
        balance: +parseInt(monthly),
        ispaid: "Paid",
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
      paymethod,
      paymentdate,
      rechargedate,
      subareaId,
      paidby,
      amountpaid, //user actual amount paid
      balance, // user previous balanace
    } = req.body;

    // Calculate the Start Date
    const startDate = new Date();
    const entries = [];

    //Genrate monthly entries
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
    console.log(`Amount Paid ${amountpaid}`)
    console.log(`monthly ${monthly}`)
    console.log(`balance ${balance}`)


    const payableamount = parseInt(monthly) * parseInt(monthspaid) + parseInt(balance)
    const totalBalance = payableamount - parseInt(amountpaid);

    console.log(`Payable Amount ${payableamount}`)
    console.log(`New balance ${totalBalance}`)
    console.log(new Date(paymentdate).toLocaleString())
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );

    const today = new Date(rechargedate);
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + parseInt(monthspaid),
      10
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
      paymethod,
      paymentdate: new Date(paymentdate).toLocaleString(), 
      subareaId,
      paidby,
      balance, // user previous balanace
      entries,
    });


    console.log(totalBalance, nextMonth)
    await newPay.save();

    // update client status and update recharged date
    const updclient = await Client.findByIdAndUpdate(
      { _id: id },
      {
        balance: totalBalance,
        status: "Active",
        ispaid: "Paid",
        rechargedate: new Date(nextMonth).toLocaleDateString(),
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Payment Added Successfully" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Payment Server Error",
    });
  }
};
