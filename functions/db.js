// db.js
import mongoose from 'mongoose';

const uri = "mongodb+srv://azriynazariee:tIZw5NkfPLNFPfDn@project.6i6ahbb.mongodb.net/project?retryWrites=true&w=majority&appName=project";

export async function connect() {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  });
  console.log("Connected to MongoDB via Mongoose");
}

export function getDB() {
  return mongoose.connection;
}
