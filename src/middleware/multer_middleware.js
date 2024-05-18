const multer  = require("multer");

//multer middleware for file storage & handling
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
  
const upload = multer({
     storage,
 })
 module.exports = {upload};