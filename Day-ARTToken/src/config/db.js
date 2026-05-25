let connectDB = async () => {
  try {

   await mongoose.connect("mongoose://0.0.0.0/test-artoken")
      console.log("Connected to the database")
    


  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
module.exports = connectDB;