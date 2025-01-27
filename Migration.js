import connectToDatabase from "./db/db.js";
import mongoose, { Schema } from "mongoose";
import collectionSchema from "./models/Collection.js";

const collectionMigration = async () => {
  connectToDatabase();
  const Collection = mongoose.model(
    "heefa_collection",
    collectionSchema
  );
  try {
    // Fetch all subscriptions where `entries` is not yet created
    const subscriptions = await Collection.find(
      // month: { $exists: true }, // Check if the old `month` field exists
      // entries: { $exists: false }, // Ensure new `entries` field doesn't exist
    );

    console.log(`Found ${subscriptions.length} subscriptions to migrate.`);

    // Loop through each subscription and migrate the data
    // for (const subscription of subscriptions) {
    //   // Convert the old `month` field to the new `entries` array
    //   const newEntry = {
    //     month: subscription.month, // Use the old `month` value
    //   };

      // subscription.entries = [newEntry]; // Assign the new `entries` field
      subscriptions.month = undefined; // Optionally remove the old `month` field

      // Save the updated subscription back to the database
      await subscriptions.save();
      console.log(`Migrated subscription with ID: ${subscriptions._id}`);
    // }

    console.log("Migration completed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error during migration:", error);
    mongoose.connection.close();
  }
};
collectionMigration();
