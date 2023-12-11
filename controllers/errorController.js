const appError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  let message = `Invalid ${error.path} : ${error.valueType}`;
  return new appError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  let message = `Name or email , is taken before`;
  return new appError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const message = `Validation error : ${Object.values(error.errors)
    .map((ele) => ele.message)
    .join('. ')}`;
  return new appError(message, 400);
};
const handleJWTError = (_) => {
  return new appError('invalid token , please login again', 401);
};
const handleJWTExpiredError = (_) => {
  return new appError('token expired, please login again', 401);
};
///////////////////////////////////////////////////////
const handleDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    data: {
      message: err.message,
      error: err,
      stack: err.stack,
    },
  });
};

const handleProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }
};
//////////////////////////////////////////////////////////
module.exports = (err, req, res, next) => {
  err.statusCode ||= 500;
  err.status ||= 'failed';
  if (process.env.NODE_ENV === 'development') handleDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    console.log(err.name);
    // operational errors from mongodb driver
    //(handleInvalidIdDB - handleDuplicateValDB - handleValidationDB)
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    // operational errors from jwt
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    handleProd(error, res);
  }
};
