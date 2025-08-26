import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

async function fixOrderIndexes() {
  try {
    console.log("🔧 Starting database index cleanup...");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");

    // Check existing indexes
    console.log("📋 Checking existing indexes...");
    const indexes = await ordersCollection.indexes();
    console.log(
      "Current indexes:",
      indexes.map((idx) => ({ name: idx.name, key: idx.key })),
    );

    // Remove problematic orderId index if it exists
    try {
      console.log("🗑️ Attempting to drop orderId_1 index...");
      await ordersCollection.dropIndex("orderId_1");
      console.log("✅ Successfully dropped orderId_1 index");
    } catch (error) {
      if (error.code === 27 || error.message.includes("index not found")) {
        console.log("ℹ️ orderId_1 index doesn't exist, continuing...");
      } else {
        console.log("⚠️ Could not drop index:", error.message);
      }
    }

    // Delete orders with null orderId
    console.log("🧹 Cleaning up orders with null orderId...");
    const deleteResult = await ordersCollection.deleteMany({
      $or: [{ orderId: null }, { orderId: { $exists: false } }],
    });
    console.log(
      `✅ Deleted ${deleteResult.deletedCount} orders with null orderId`,
    );

    // Update existing orders to have orderId if they don't have one
    console.log("🔄 Updating existing orders without orderId...");
    const ordersWithoutId = await ordersCollection
      .find({
        $or: [
          { orderId: { $exists: false } },
          { orderId: null },
          { orderId: "" },
        ],
      })
      .toArray();

    let updateCount = 0;
    for (const order of ordersWithoutId) {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderId = `ODR${timestamp}${random}${updateCount}`;

      await ordersCollection.updateOne(
        { _id: order._id },
        { $set: { orderId: orderId } },
      );
      updateCount++;
    }
    console.log(`✅ Updated ${updateCount} orders with new orderId`);

    // Create proper indexes
    console.log("📊 Creating proper indexes...");
    try {
      await ordersCollection.createIndex({ orderId: 1 }, { unique: true });
      console.log("✅ Created unique index on orderId");
    } catch (error) {
      console.log(
        "⚠️ Index on orderId already exists or could not be created:",
        error.message,
      );
    }

    try {
      await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true });
      console.log("✅ Created unique index on orderNumber");
    } catch (error) {
      console.log(
        "⚠️ Index on orderNumber already exists or could not be created:",
        error.message,
      );
    }

    // Verify final state
    console.log("🔍 Verifying final state...");
    const finalIndexes = await ordersCollection.indexes();
    console.log(
      "Final indexes:",
      finalIndexes.map((idx) => ({ name: idx.name, key: idx.key })),
    );

    const totalOrders = await ordersCollection.countDocuments();
    const ordersWithOrderId = await ordersCollection.countDocuments({
      orderId: { $exists: true, $ne: null },
    });
    console.log(
      `📊 Total orders: ${totalOrders}, Orders with orderId: ${ordersWithOrderId}`,
    );

    console.log("✅ Database index cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing database indexes:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await fixOrderIndexes();
    console.log(
      "\n🎉 Database cleanup completed! You can now create orders without conflicts.",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

main();
