const { default: mongoose } = require("mongoose");

//MongoDB connection Function
const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully!!");
  } catch (error) {
    console.log(error);
  }
};
module.exports = dbConnect;