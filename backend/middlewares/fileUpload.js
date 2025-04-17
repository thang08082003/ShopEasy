const path = require('path');
const multer = require('multer');
const ErrorResponse = require('../utils/errorResponse');

// Storage configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new ErrorResponse(
        'File upload only supports the following filetypes: jpeg, jpg, png, gif',
        400
      )
    );
  }
};

// Upload configuration
const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter
});

module.exports = { upload };
