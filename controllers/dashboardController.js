import mongoose, { Schema } from "mongoose";
import clientSchema from "../models/Clients.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import collectionSchema from "../models/Collection.js";
import packageSchema from "../models/Packages.js";

export const getEmployeeDashboard = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {

    const user = await User.findById({ _id: decoded._id }).select({name :1});
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const totalClient = await Client.find({
      status: "Active",
    }).countDocuments();
 
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );

    const unpaidClients = await Client.find({
      $and : [ {ispaid: "Unpaid"} , {status: { $ne: "Terminated" }} ]
    }).countDocuments().lean();

    const today = new Date()
    const threeDaysLater = new Date()
    threeDaysLater.setDate(today.getDate() + 3)
    const expiringUsers = await Client.find({
      rechargedate : {$gte : today, $lte : threeDaysLater },
    }).countDocuments()

    const Payments = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const clientsCollection = await Payments.find({paidby: user.name})
      .populate("paidby")
    .limit(10).sort({createdAt : -1});

    const parsedDate = new Date()
    // const year = parsedDate.getUTCFullYear()
    const years = parsedDate.getFullYear()
    const months = parsedDate.getMonth()
    
    const startDate = new Date(years, months, 1).toLocaleString()
    const endDate = new Date(years, months + 1, 1).toLocaleString()
    const totalCollection = await Collection.aggregate([
      { $match: { paymentdate : {$gte : new Date(startDate), $lt : new Date(endDate)}, status: "Paid", paidby: user.name} },
      { $group: { _id: null, totalAmount: { $sum: "$amountpaid" } } }, 
    ]);

    return res.status(200).json({
      success: true,
      totalClient,
      unpaidClients,
      expiringUsers,
      clientsCollection ,
      totalAmount: totalCollection[0]?.totalAmount || 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Can't get dashboard data server error" });
  }
};

export const getDashboard = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  const network_name = decoded.networkname;
  try {
    const Client = mongoose.model(network_name + "_client", clientSchema);
    const totalClient = await Client.find({
      status: "Active",
    }).countDocuments();

    const totalRecovery = await Client.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id:null,  recovery: { $sum: "$monthly" } } },
    ]);
    const today = new Date()
    const threeDaysLater = new Date()
    threeDaysLater.setDate(today.getDate() + 3)
    const expiringUsers = await Client.find({
      rechargedate : {$gte : today, $lte : threeDaysLater },
    }).countDocuments()

    const Package = mongoose.model(network_name + "_packages", packageSchema);

    const packageCount = await Client.aggregate([
      {
        $match: {
          status: "Active",
        },
      },
      {
        $group: {
          _id: "$packageId",
          clients: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: network_name + "_packages",
          localField: "_id",
          foreignField: "_id",
          as: "result",
          pipeline: [
            {
              $project: {
                _id: 0,
                package_name:1,
              },
            },
          ],
        },
      },
    ]);
    
    const Collection = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );

    const unpaidClients = await Client.find({
      $and : [ {ispaid: "Unpaid"} , {status: { $ne: "Terminated" }} ]
    }).countDocuments().lean();

    const Payments = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const clientsCollection = await Payments.find()
      .populate("paidby")
    .limit(10).sort({createdAt : -1});

    const parsedDate = new Date()
    // const year = parsedDate.getUTCFullYear()
    const years = parsedDate.getFullYear()
    const months = parsedDate.getMonth()
    
    const startDate = new Date(years, months, 1).toLocaleString()
    const endDate = new Date(years, months + 1, 1).toLocaleString()
    const totalCollection = await Collection.aggregate([
      { $match: { paymentdate : {$gte : new Date(startDate), $lt : new Date(endDate)}, status: "Paid"} },
      { $group: { _id: null, totalAmount: { $sum: "$amountpaid" } } }, 
    ]);

    return res.status(200).json({
      success: true,
      totalClient,
      recovery: totalRecovery[0]?.recovery || 0,
      packageCount,
      unpaidClients,
      expiringUsers,
      clientsCollection ,
      totalAmount: totalCollection[0]?.totalAmount || 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Can't get dashboard data server error" });
  }
};