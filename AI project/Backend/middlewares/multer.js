import multer from "multer";
import fs from "fs";

// Configure storage safely
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });
export default upload;