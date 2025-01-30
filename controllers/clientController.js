import clientSchema from "../models/Clients.js";
import packageSchema from "../models/Packages.js";
import subareaSchema from "../models/SubArea.js";
import mongoose, { Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import collectionSchema from "../models/Collection.js";

export const deactivateClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY); 
  const network_name = decoded.networkname;


  const { id } = req.params;
  const {
    status,
  } = req.body

try {
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const updclient = await Client.findByIdAndUpdate({_id: id},{
    status,
  })
  if (!updclient) {
    return res
      .status(404)
      .json({ success: false, error: "Document Not Found" });
  }
  return res
  .status(200)
  .json({ success: true, message: "Client Deactivated Successfully" });
} catch (error) {
return res
  .status(500)
  .json({ success: false, error: "Edit Client server error" });
}
}

export const activateClient = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY); 
  const network_name = decoded.networkname;


  const { id } = req.params;
  const {
    rechargedate,
  } = req.body

try {
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const updclient = await Client.findByIdAndUpdate({_id: id},{
    status : "Active",
    rechargedate,
  })
  if (!updclient) {
    return res
      .status(404)
      .json({ success: false, error: "Document Not Found" });
  }
  return res
  .status(200)
  .json({ success: true, message: "Client Activated Successfully" });
} catch (error) {
return res
  .status(500)
  .json({ success: false, error: "Edit Client server error" });
}
}

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


  const { id } = req.params;
  const {
    subareaId,
    name,
    address,
    phonenumber,
    mobilenumber,
    packageId,
    monthly,
    status,
    rechargedate,
  } = req.body

try {
  const Client = mongoose.model(network_name + "_client", clientSchema);
  const updclient = await Client.findByIdAndUpdate({_id: id},{
    subareaId,
    name,
    address,
    phonenumber, 
    mobilenumber,
    packageId,
    monthly,
    status,
    rechargedate,
  })
  if (!updclient) {
    return res
      .status(404)
      .json({ success: false, error: "Document Not Found" });
  }
  return res
  .status(200)
  .json({ success: true, message: "Client Updated Successfully" });
} catch (error) {
return res
  .status(500)
  .json({ success: false, error: "Edit Client server error" });
}
}

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
      paidby,
      rechargedate,
      status,
      dayspayment,
      network_name,
    } = req.body;
    const Client = mongoose.model(network_name + "_client", clientSchema);

    const client = await Client.findOne({ internetid: internetid });
    if (client) {
      return res
        .status(400) 
        .json({ success: false, error: `${internetid} Already Exists!`, input:req.body });
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
      rechargedate,
      status,
    });
    await newClient.save();
    if(dayspayment > 0) {

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
      const Collection = mongoose.model(
        network_name + "_collection",
        collectionSchema
      );
      const Package = mongoose.model(network_name + '_packages', packageSchema)
      const id = await Client.findOne({internetid:internetid})
      const package_name = await Package.findOne({_id:packageId})
      const newPay = new Collection({
        clientId: id._id,
        internetid,
        name,
        address,
        packageId: package_name.package_name,
        subareaId : subareaId,
        monthly, // user actual fees
        amountpaid : dayspayment, //how much user paid
        paymentdate: new Date(insdate).toLocaleString(), 
        paidby,
      });
      await newPay.save();
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
      .json({ success: true, message: "Client Add Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Can't Add Client Server Error",
    });
  }
};
