require ("dotenv").config(); 
let app = require("./src/app.js"); 
const connectDB = require("./src/config/db.js");


// -------------Connect to the database ---------------------------
connectDB();

let port = process.env.PORT || 3000; // set the port

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});