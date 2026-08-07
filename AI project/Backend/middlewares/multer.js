import multer from "multer";


// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/'); // files will be saved in the 'uploads' folder
    },
    filename: (req, file, cb) => {
       return cb(null , file.originalname)
    }
});

const upload = multer({ storage: storage });
export default upload;  