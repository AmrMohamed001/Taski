class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith('5') ? 'server error' : 'failed';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = appError;
