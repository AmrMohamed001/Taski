const express = require('express');
const Router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../controllers/authentication');
const userRoute = require('./userRoute');
////////////////////////////////////////////////
Router.use('/:taskId/users', userRoute);
////////////////////////////////////////////////
Router.use(auth.protect);
Router.get('/monthly-plan/:year', taskController.monthlyPlan);
Router.get('/tasks-status', taskController.tasksStatus);

Router.route('/')
  .get(taskController.getTasks)
  .post(taskController.uploadTaskFile, taskController.addTask);
Router.route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);
////////////////////////////////////////////////
module.exports = Router;
