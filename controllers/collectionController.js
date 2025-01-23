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
  const  {status ,rechargedate,clientId, monthly }  = req.body;
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
    )
    const today = new Date(rechargedate)
    const nextMonth = new Date(today.getFullYear(), today.getMonth()-1,10)
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const updclient = await Client.findByIdAndUpdate({_id: clientId},{
      balance: - parseInt(monthly),
      ispaid : 'Unpaid',
      rechargedate: nextMonth,
    })

    return res.status(200).json({ success: true, message: "successfully change"});
  } catch (error) {
    console.log(error)
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
  const  {status ,rechargedate,clientId, monthly }  = req.body;
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
    )
    const today = new Date(rechargedate)
    const nextMonth = new Date(today.getFullYear(), today.getMonth()+1,10)
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const updclient = await Client.findByIdAndUpdate({_id: clientId},{
      balance: + parseInt(monthly),
      ispaid : 'Paid',
      rechargedate: nextMonth,
    })

    return res.status(200).json({ success: true, message: "successfully change"});
  } catch (error) {
    console.log(error)
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
    const legder = await Collection.find({clientId: id})
      .populate({ path: "subareaId", model: network_name + "_subarea" })
      .populate({ path: "clientId", model: network_name + "_client" });
    return res.status(200).json({ success: true, legder});
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
    const clientsCollection = await Collection.find().sort({createdAt : -1}).populate({ path: "clientId", select: "rechargedate", model: Client });
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
      monthly,
      paymethod,
      month,
      year,
      paymentdate,
      rechargedate,
      subareaId,
      paidby,
      fixedmonthly,
      balance,
    } = req.body;
    

      const totalBalance = parseInt(balance) + parseInt(fixedmonthly) - parseInt(monthly)
    
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const today = new Date(rechargedate)
    const nextMonth = new Date(today.getFullYear(), today.getMonth()+1,10)
        const Client = mongoose.model(network_name + "_client", clientSchema);

    const ifPaid = await Collection.find({$and : [{"month":month}, {"year":year}, {"clientId": id}]}).countDocuments()
      if(ifPaid) {
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
      monthly,
      paymethod,
      month,
      year,
      paymentdate, 
      subareaId,
      paidby,
    });
     await newPay.save();
     const updclient = await Client.findByIdAndUpdate({_id: id},{
      balance: totalBalance,
      status : 'Active',
      ispaid : 'Paid',
      rechargedate: nextMonth,
    })
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
