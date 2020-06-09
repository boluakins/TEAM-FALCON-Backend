const multer = require('multer')

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
          cb(null, './uploads')
     },
     filename: (req, file, cb) => {
          let filename = `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`
          cb(null, filename)
     }
})

const upload = multer({
     storage: storage
});

module.exports = upload