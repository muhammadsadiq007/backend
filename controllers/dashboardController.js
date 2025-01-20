import mongoose, { Schema } from "mongoose";
import clientSchema from "../models/Clients.js";
import jwt from "jsonwebtoken";
import collectionSchema from "../models/Collection.js";
import { compareAsc, format } from "date-fns";
import packageSchema from "../models/Packages.js";

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
    const month = format(new Date(), "MMMM");
    const year = format(new Date(), "yyyy");

    const unpaidClients = await Client.find({
      ispaid: "Unpaid",
    }).countDocuments();

    const Payments = mongoose.model(
      network_name + "_collection",
      collectionSchema
    );
    const clientsCollection = await Payments.find()
      .populate("paidby")
    .limit(10).sort({createdAt : -1});

    const totalCollection = await Collection.aggregate([
      { $match: { month: month, status: "Paid" } },
      { $group: { _id: { month: month }, totalAmount: { $sum: "$monthly" } } },
    ]);

    return res.status(200).json({
      success: true,
      totalClient,
      recovery: totalRecovery[0]?.recovery || 0,
      packageCount,
      unpaidClients,
      clientsCollection ,
      packageCount,
      totalAmount: totalCollection[0]?.totalAmount || 0,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Can't get dashboard data server error" });
  }
};
