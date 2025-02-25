import connectToDatabase from "./db/db.js";
import clientSchema from "./models/Clients.js";
import mongoose, { Schema, Types } from "mongoose";
import collectionSchema from "./models/Collection.js";

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

    // const Client = mongoose.model("heefa_client", clientSchema);
    const Collection = mongoose.model(
      "heefa_collection",
      collectionSchema
    );
    const result = await Collection.deleteMany({
      "entries.month": "January 2025"
    });

    console.log(`Client: ${result.modifiedCount} Has been deleted `);
  } catch (error) {
    console.log(error);
  }
};

userRegister();
