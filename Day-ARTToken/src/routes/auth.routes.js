let express = require("express");
let router = express.Router();



router.post("/register", (req, res) => {
  res.json({ message: "User registration endpoint" });
});

router.post("/login", (req, res) => {
  res.json({ message: "User login endpoint" });
});

module.exports = router;