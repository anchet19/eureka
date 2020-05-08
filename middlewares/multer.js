const multer = require('multer')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3')
const path = require('path')


aws.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  region: 'us-east-1'
})

const s3 = new aws.S3({
  apiVersion: "2006-03-01",
});

exports.upload = multer({
  fileFilter: (request, file, cb) => {
    if (file.fieldName === 'menu') {
      if (!file.mimetype.includes('pdf')) {
        request.fileValidationError = 'Menu must be pdf or docx format'
        return cb(new Error("Menu must be pdf or docx format"), false)
      }
      cb(null, true)
    }
    if (file.fieldname === 'photo') {
      if (
        !file.mimetype.includes('jpeg') &&
        !file.mimetype.includes('jpg') &&
        !file.mimetype.includes('png') &&
        !file.mimetype.includes('gif')
      ) {
        request.fileValidationError = "Only photos may be uploaded to the gallery"
        return cb(new Error("Only photos may be uploaded to the gallery"), false)
      }
      cb(null, true)
    }
    cb(null, true)
  },
  storage: multerS3({
    s3: s3,
    bucket: 'senior-project-eureka',
    // acl: 'public-read',
    metadata: (request, file, cb) => {
      cb(null, { fieldName: "testdata" })
    },
    contentType: (request, file, cb) => {
      cb(null, file.mimetype)
    },
    key: (request, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(
        null,
        request.body.uid
        + `/${file.fieldname}s/`
        + path.basename(file.originalname, ext).toLowerCase()
        + Date.now().toString()
        + ext.toLowerCase()
      )
    }
  })
}).fields([{ name: 'menu', maxCount: 1 }, { name: 'photo', maxCount: 5 }])