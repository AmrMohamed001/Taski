const express = require('express');
const Router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../controllers/authentication');
const userRoute = require('./userRoute');
////////////////////////////////////////////////
////////////////////////////////////////////////
Router.use(auth.protect);
Router.get('/monthly-plan/:year', taskController.monthlyPlan);
Router.get('/tasks-status', taskController.tasksStatus);
Router.post(
  '/update-checklist/:taskId/:checklistId',
  taskController.updateCheckList
);
Router.get(
  '/update-checklist/:taskId/:checklistId',
  taskController.deleteCheckList
);
Router.route('/')
  .get(taskController.getTasks)
  .post(taskController.uploadTaskFile, taskController.addTask);
Router.route('/:id')
  .get(taskController.getTask)
  .post(taskController.updateTask)
  .get(taskController.deleteTask);
////////////////////////////////////////////////
module.exports = Router;
