import mongoose, { Schema } from "mongoose";
import collectionSchema from "../models/Collection.js";
import logsSchema from "../models/Logs.js";
import jwt from "jsonwebtoken";
import subareaSchema from "../models/SubArea.js";
import clientSchema from "../models/Clients.js";

export const renewClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;

  try {
    const { id } = req.params;
    const {
      internetid,
      name,
      address,
      packageId,
      paymentmethod,
      subareaId,
      paidby,
      amountpaid, //user actual amount paid
    } = req.body.collectionData;
    const paymentdate = req.body.paymentDate;
    const entries = [];
    const entry = {
      month: "Days Amount",
    };
    entries.push(entry);
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
      paymentmethod,
      paymentdate: new Date(paymentdate),
      subareaId,
      paidby,
      amountpaid, //how much user paid
      entries,
    });

    await newPay.save();
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Renew",
      newstatus: "Renew",
      oldstatus: "Terminated",
      targetId: id,
    });
    await log.save();
    const Client = mongoose.model(network_name + "_client", clientSchema);
    await Client.findByIdAndUpdate(
      { _id: id },
      {
        status: "Active",
        ispaid: "Paid",
        rechargedate: new Date(newExpiryDate).setHours(
          new Date(newExpiryDate).getHours() + 5
        ),
      }
    );
    return res.status(200).json({
      success: true,
      message: `${internetid} Payment Added Successfully`,
    });
  } catch (error) {
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
  const expirytype = decoded.expirytype;
  const _id = decoded._id;
  const { id } = req.params;

  const { status, rechargedate, balance, clientId, amountpaid, monthspaid } =
    req.body;
  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    await Collection.findByIdAndUpdate(
      { _id: id },
      {
        status: status,
      }
    );
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Payment Status",
      newstatus: status,
      oldstatus: "Paid",
      targetId: clientId,
    });
    await log.save();
    const today = new Date(rechargedate);
    let nextMonth;
    if (expirytype === "Monthly") {
      nextMonth = new Date(
        today.getFullYear(),
        today.getMonth() - parseInt(monthspaid),
        10
      );
    } else {
      nextMonth = new Date(
        today.setDate(today.getDate() - 30 * parseInt(monthspaid))
      );
    }
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clientUpdate = await Client.findByIdAndUpdate(
      { _id: clientId },
      {
        balance: balance,
        ispaid: status,
        status: "In-Active",
        rechargedate: new Date(nextMonth),
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
  const expirytype = decoded.expirytype;
  const _id = decoded._id;
  const { id } = req.params;
  const { status, monthly, balance, clientId, amountpaid, monthspaid } =
    req.body;
  try {
    let totalBalance;
    const payableamount =
      parseInt(monthly) * parseInt(monthspaid) + parseInt(balance);
    if (monthly === "0") {
      totalBalance = "0";
    } else {
      totalBalance = payableamount - parseInt(amountpaid);
    }
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    await Collection.findByIdAndUpdate(
      { _id: id },
      {
        status: status,
      }
    );
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Payment Status",
      newstatus: status,
      oldstatus: "Unpaid",
      targetId: clientId,
    });
    await log.save();
    const today = new Date();
    let nextMonth;
    if (expirytype === "Monthly") {
      nextMonth = new Date(
        today.getFullYear(),
        today.getMonth() - parseInt(monthspaid),
        10
      );
    } else {
      nextMonth = new Date(
        today.setDate(today.getDate() - 30 * parseInt(monthspaid))
      );
    }
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clientUpdate = await Client.findByIdAndUpdate(
      { _id: clientId },
      {
        balance: totalBalance,
        ispaid: status,
        status: "Active",
        rechargedate: new Date(nextMonth).setHours(
          new Date(nextMonth).getHours() + 5
        ),
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
    const timeZoneOffset = `+05:00`;
    const now = new Date();
    // First day of the month at 00:00:00.000
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate =
      startOfMonth.toISOString().split("T")[0] +
      `T23:59:59.999${timeZoneOffset}`;

    // Last day of the month at 23:59:59.999
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endDate =
      endOfMonth.toISOString().split("T")[0] + `T23:59:59.999${timeZoneOffset}`;

    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clientsCollection = await Collection.find({
      "entries.month": { $ne: "Other" },
      paymentdate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
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
  const expirytype = decoded.expirytype;
  const _id = decoded._id;
  const { id } = req.params;

  try {
    const {
      internetid,
      name,
      address,
      packageId,
      monthly, // user actual fees
      tvmonthly,
      tvpackage,
      monthspaid,
      paymentmethod,
      paytype,
      subareaId,
      transid,
      paidby,
      amountpaid, //user actual amount paid
      balance, // user previous balanace
    } = req.body.collectionData;
    const paymentdate = req.body.paymentDate;
    // Calculate the Start Date
    const startDate = new Date(paymentdate);
    const entries = [];

    let newExpiryDate;
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    // Advance Payments
    if (paytype === "advance") {
      for (let i = 0; i < monthspaid; i++) {
        const monthDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1 + i
        );
        const entry = {
          month:
            monthDate.toLocaleString("default", { month: "long" }) +
            " " +
            monthDate.getFullYear(),
        };
        entries.push(entry);
      }
      if (expirytype === "Variable") {
        const today = new Date();
        const user = await Client.findById({ _id: id });
        if (!user.rechargedate || user.rechargedate < today) {
          // Pehli dafa ya expired ho chuki ho to aaj se 30 din badhao
          newExpiryDate = new Date(
            today.setDate(today.getDate() + 30 * parseInt(monthspaid))
          );
        } else {
          // Pehle se expiryDate hai, usi se 30 din badhao
          newExpiryDate = new Date(user.rechargedate);
          newExpiryDate.setDate(
            newExpiryDate.getDate() + 30 * parseInt(monthspaid)
          );
        }
      } else {
        const today = new Date(paymentdate);
        newExpiryDate = new Date(
          today.getFullYear(),
          today.getMonth() + parseInt(monthspaid) + 1,
          10
        );
      }
    }

    //Genrate monthly entries
    if (paytype === "monthly") {
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
      if (expirytype === "Variable") {
        const today = new Date();
        const user = await Client.findById({ _id: id });
        if (!user.rechargedate || user.rechargedate < today) {
          // Pehli dafa ya expired ho chuki ho to aaj se 30 din badhao
          newExpiryDate = new Date(
            today.setDate(today.getDate() + 30 * parseInt(monthspaid))
          );
        } else {
          // Pehle se expiryDate hai, usi se 30 din badhao
          newExpiryDate = new Date(user.rechargedate);
          newExpiryDate.setDate(
            newExpiryDate.getDate() + 30 * parseInt(monthspaid)
          );
        }
      } else {
        const today = new Date(paymentdate);
        newExpiryDate = new Date(
          today.getFullYear(),
          today.getMonth() + parseInt(monthspaid),
          10
        );
      }
    }

    let tvAmount;
    if (tvmonthly) {
      tvAmount = parseInt(tvmonthly) * parseInt(monthspaid);
    } else {
      tvAmount = "0";
    }

    let netmonthly;
    if (monthly) {
      netmonthly = parseInt(monthly) * parseInt(monthspaid);
    } else {
      netmonthly = "0";
    }

    const payableamount =
      parseInt(netmonthly) * parseInt(monthspaid) +
      parseInt(balance) +
      parseInt(tvAmount);
    const totalBalance = payableamount - parseInt(amountpaid)

    const ifPaid = await Collection.find({
      clientId: id,
      "entries.month": { $in: entries.map((e) => e.month) },
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
      tvmonthly,
      tvpackage,
      amountpaid, //how much user paid
      monthspaid, // NO of month
      paymentmethod,
      paymentdate,
      subareaId,
      status: "Paid",
      transid,
      paidby,
      balance, // user previous balanace
      entries,
    });
    await newPay.save();
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Payment",
      newstatus: "Paid",
      oldstatus: "Unpaid",
      targetId: id,
    });
    await log.save();

    const clientUpdate = await Client.findByIdAndUpdate(
      { _id: id },
      {
        balance: totalBalance,
        status: "Active",
        ispaid: "Paid",
        istvpaid: "Paid",
        rechargedate: new Date(newExpiryDate).setHours(
          new Date(newExpiryDate).getHours() + 5
        ),
      }
    );
    return res.status(200).json({
      success: true,
      message: `${internetid} Payment Added Successfully`,
      id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Payment Server Error",
    });
  }
};

export const addAmount = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;
  const { id } = req.params;
  try {
    const {
      internetid,
      name,
      address,
      subareaId,
      packageId,
      balance,
      newbalance,
      remarks,
      paidby, //user actual amount paid
    } = req.body.clientAmount;
    const paymentdate = req.body.paymentDate;
    const entries = [];
    const entry = {
      month: "Other",
    };
    entries.push(entry);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const newPay = new Collection({
      clientId: id,
      internetid,
      name,
      address,
      balance: newbalance,
      paymentdate,
      subareaId,
      packageId,
      paidby,
      remarks,
      entries,
    });
    await newPay.save();
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Add Amount",
      newstatus: parseInt(newbalance) + parseInt(balance),
      oldstatus: balance,
      targetId: id,
    });
    await log.save();
    await Client.findByIdAndUpdate(
      { _id: id },
      {
        balance: parseInt(newbalance) + parseInt(balance),
      }
    );
    return res.status(200).json({
      success: true,
      message: `${internetid} Payment Added Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Payment Server Error",
    });
  }
};

export const deleteAmount = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;
  const { id } = req.params;
  try {
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const collection = await Collection.findById(id);
    const clientBalance = await Client.findOne({ _id: collection.clientId });

    // console.log(collection.balance - clientBalance.balance)
    const newBalance = parseInt(
      clientBalance.balance - parseInt(collection.balance)
    );

    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Delete Amount",
      newstatus: "Amount Delete",
      oldstatus: collection.balance,
      targetId: id,
    });
    await log.save();
    await Client.findByIdAndUpdate(
      { _id: collection.clientId },
      {
        balance: newBalance,
      }
    );
    await Collection.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `${collection.internetid} Payment Deleted Successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Payment Server Error",
    });
  }
};

export const otherAmount = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;
  const { id } = req.params;
  try {
    const {
      internetid,
      name,
      address,
      paymentdate,
      paymentmethod,
      transid,
      subareaId,
      packageId,
      balance,
      paidby,
      amountpaid, //user actual amount paid
    } = req.body;
    const entries = [];
    const entry = {
      month: "Balance Receive",
    };
    entries.push(entry);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const newPay = new Collection({
      clientId: id,
      internetid,
      name,
      address,
      balance,
      paymentmethod,
      transid,
      amountpaid, //how much user paid
      paymentdate: new Date(paymentdate).toLocaleString(),
      subareaId,
      packageId,
      paidby,
      entries,
    });
    await newPay.save();
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Other Amount",
      newstatus: balance,
      oldstatus: parseInt(balance) - parseInt(amountpaid),
      targetId: id,
    });
    await log.save();
    await Client.findByIdAndUpdate(
      { _id: id },
      {
        balance: parseInt(balance) - parseInt(amountpaid),
      }
    );
    return res.status(200).json({
      success: true,
      message: `${internetid} Payment Added Successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Payment Server Error",
    });
  }
};

export const delCollection = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;
  const { id } = req.params;

  try {
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const delData = await Collection.findById({ _id: id });
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Delete Payment",
      newstatus: "Deleted",
      oldstatus: delData.status,
      targetId: delData.clientId,
    });
    await log.save();
    const legder = await Collection.findByIdAndDelete({ _id: id });
    return res
      .status(200)
      .json({ success: true, message: "successfully change" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};
