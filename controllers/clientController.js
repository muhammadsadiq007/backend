import clientSchema from "../models/Clients.js";
import packageSchema from "../models/Packages.js";
import subareaSchema from "../models/SubArea.js";
import logsSchema from "../models/Logs.js";
import mongoose, { Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import collectionSchema from "../models/Collection.js";

export const deactivateClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;

  const { id } = req.params;
  const { status } = req.body;

  try {
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const updclient = await Client.findByIdAndUpdate(
      { _id: id },
      {
        status,
      }
    );
    if (!updclient) {
      return res
        .status(404)
        .json({ success: false, error: "Document Not Found" });
    }
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Client Status",
      newstatus: status,
      oldstatus: "Active",
      targetId: id,
    });
    await log.save();
    return res
      .status(200)
      .json({ success: true, message: `${internetid} has been Deactivated` });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Client Deactivated server error" });
  }
};

export const activateClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const expirytype = decoded.expirytype;
  const _id = decoded._id;

  const { id } = req.params;

  try {
    let rechargedate;

    if (expirytype === "Variable") {
      const today = new Date();
      rechargedate = new Date(today.setDate(today.getDate() + 30));
    } else {
      rechargedate = req.body;
    }
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const updclient = await Client.findByIdAndUpdate(
      { _id: id },
      {
        status: "Active",
        rechargedate: new Date(rechargedate).setHours(
          new Date(rechargedate).getHours() + 5
        ),
      }
    );
    if (!updclient) {
      return res
        .status(404)
        .json({ success: false, error: "Document Not Found" });
    }
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Client Status",
      newstatus: "Active",
      oldstatus: "In-Active",
      targetId: id,
    });
    await log.save();
    return res
      .status(200)
      .json({ success: true, message: `Client has been Activated` });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Edit Client server error" });
  }
};

export const getClient = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Package = mongoose.model(network_name + "_packages", packageSchema);
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const client = await Client.findById(id)
      .populate({
        path: "packageId",
        select: "package_name",
        model: Package,
      })
      .populate({
        path: "tvpackageId",
        select: "package_name",
        model: Package,
      })
      .populate({
        path: "subareaId",
        model: SubArea,
      });
    return res.status(200).json({ success: true, client });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const editClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  const _id = decoded._id;

  const { id } = req.params;
  const {
    subareaId,
    name,
    address,
    phonenumber,
    mobilenumber,
    packageId,
    discount,
    tvdiscount,
    monthly,
    tvcable,
    tvpackageId,
    tvmonthly,
    istvpaid,
  } = req.body;
  try {
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const updclient = await Client.findByIdAndUpdate(
      { _id: id },
      {
        subareaId,
        name,
        address,
        phonenumber,
        mobilenumber,
        packageId,
        monthly,
        discount,
        tvcable,
        tvpackageId,
        tvdiscount,
        tvmonthly,
        istvpaid,
      }
    );
    if (!updclient) {
      return res
        .status(404)
        .json({ success: false, error: "Document Not Found" });
    }
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const log = new Logs({
      userId: _id, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "Edit Client",
      newstatus: "Edit Client",
      targetId: id,
    });
    await log.save();
    return res
      .status(200)
      .json({ success: true, message: "Client has been Updated" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Edit Client server error" });
  }
};

export const getClients = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Package = mongoose.model(network_name + "_packages", packageSchema);
    const SubArea = mongoose.model(network_name + "_subarea", subareaSchema);
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const clients = await Client.find()
      .populate("userId", { name: 1 })
      .populate({
        path: "packageId",
        select: "package_name",
        model: Package,
      })
      .populate({
        path: "subareaId",
        select: "subarea",
        model: SubArea,
      });
    return res.status(200).json({ success: true, clients });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get client server error" });
  }
};

export const addClients = async (req, res) => {
  try {
    const {
      internetid,
      userId,
      subareaId,
      name,
      address,
      monthly,
      phonenumber,
      mobilenumber,
      packageId,
      inscharges,
      insdate,
      balance,
      tvcable,
      tvpackageId,
      tvmonthly,
      istvpaid,
      discount,
      tvdiscount,
      paidby,
      transid,
      date,
      paymentmethod,
      status,
      dayspayment,
      network_name,
      expirytype,
    } = req.body;
    const Client = mongoose.model(network_name + "_client", clientSchema);

    const client = await Client.findOne({ internetid: internetid });
    if (client) {
      return res
        .status(400)
        .json({
          success: false,
          error: `${internetid} Already Exists!`,
          input: req.body,
        });
    }
    const newClient = new Client({
      internetid,
      userId,
      subareaId,
      name,
      address,
      monthly,
      phonenumber,
      mobilenumber,
      packageId,
      inscharges,
      insdate,
      balance,
      tvcable,
      tvpackageId,
      tvmonthly,
      istvpaid,
      discount,
      tvdiscount,
      createdAt: date,
      rechargedate: new Date(),
      status,
    });
    await newClient.save();
    const Logs = mongoose.model(network_name + "_logs", logsSchema);
    const id = await Client.findOne({ internetid: internetid });
    const log = new Logs({
      userId: userId, // Assume karein req.user middleware se aa raha hai
      action: req.method, // POST (Add), PUT (Edit), DELETE
      target: req.baseUrl, // Kis resource ko target kia
      cmd: "New Client",
      newstatus: internetid,
      targetId: id._id,
    });
    await log.save();
    const entries = [];
    if (dayspayment > 0) {
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
      if (expirytype === "Variable") {
        newExpiryDate = new Date(today.setDate(today.getDate() + 30));
        const startDate = new Date(insdate);
        const monthspaid = 1;
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
      }
      const Collection = mongoose.model(
        network_name + "_collection",
        collectionSchema
      );
      const Package = mongoose.model(network_name + "_packages", packageSchema);
      const id = await Client.findOne({ internetid: internetid });
      const package_name = await Package.findOne({ _id: packageId });
      const newPay = new Collection({
        clientId: id._id,
        internetid,
        name,
        address,
        packageId: package_name.package_name,
        subareaId: subareaId,
        amountpaid: dayspayment, //how much user paid
        paymentdate: new Date(insdate).toLocaleString(),
        transid,
        paymentmethod,
        paidby,
        entries,
      });
      await newPay.save();
      const Logs = mongoose.model(network_name + "_logs", logsSchema);
      const log = new Logs({
        userId: userId, // Assume karein req.user middleware se aa raha hai
        action: req.method, // POST (Add), PUT (Edit), DELETE
        target: req.baseUrl, // Kis resource ko target kia
        cmd: "Renew",
        newstatus: "New Client",
        oldstatus: "",
        newstatus: "Paid",
        targetId: id._id,
      });
      await log.save();
      await Client.findByIdAndUpdate(
        { _id: id._id },
        {
          status: "Active",
          ispaid: "Paid",
          rechargedate: newExpiryDate,
        }
      );
    }
    return res
      .status(200)
      .json({ success: true, message: `${internetid} has been added!` });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Server Error",
    });
  }
};
