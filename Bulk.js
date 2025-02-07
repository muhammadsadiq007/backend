import connectToDatabase from "./db/db.js";
import clientSchema from "./models/Clients.js";
import mongoose, { Schema, Types } from "mongoose";

const userRegister = async () => {
  connectToDatabase();

  try {
    const option = { ordered: true };
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      10
    ).toLocaleDateString();

    const Client = mongoose.model("heefa_client", clientSchema);
    const result = await Client.updateMany({
      rechargedate: nextMonth,
      balance: 0,
      ispaid: "Unpaid",
      status: "In-Active",
    });

    console.log(`Client: ${result.modifiedCount} Recharged Date Updated `);
  } catch (error) {
    console.log(error);
  }
};

userRegister();
