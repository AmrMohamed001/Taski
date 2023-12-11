const express = require('express');
const morgan = require('morgan');
const path = require('path');
const taskRoute = require('./routers/taskRoute');
const userRoute = require('./routers/userRoute');
const checkListRoute = require('./routers/checkListRoute');
const activitiesRoute = require('./routers/activitiesRoute');
const appError = require('./utils/appError');
const globalErrorHandling = require('./controllers/errorController');
const compression = require('compression');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const app = express();
////////////////////////////////////////////////
// middlewares
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(xss());
app.use(mongoSanitize());
app.use((req, res, next) => {
  req.requiredIn = new Date().toISOString();
  next();
});
app.use(compression());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
////////////////////////////////////////////////
// mounting
app.use('/api/v1/tasks', taskRoute);
app.use('/api/v1/users', userRoute);
// app.use('/api/v1/checks', checkListRoute);
app.use('/api/v1/activites', activitiesRoute);
app.use('/test', (req, res) => res.send('welcome to test'));
app.all('*', (req, res, next) => {
  next(new appError('this route is not found', 404));
});
app.use(globalErrorHandling);
////////////////////////////////////////////////
module.exports = app;
