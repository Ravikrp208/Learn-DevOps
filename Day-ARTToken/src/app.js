let express = require ("express");
let authRoutes = require("./routes/auth.routes.js");

let app = express(); 


app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(express.json ());







module.exports = app;
