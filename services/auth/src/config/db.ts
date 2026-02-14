import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "cravely"
    });
        console.log("Connected to MongoDB");
} catch (error) {
        console.error(error);
}
}

export default connectDB;