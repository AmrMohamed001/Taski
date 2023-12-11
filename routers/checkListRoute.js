/* const express = require('express');
const Router = express.Router();
const checkController = require('../controllers/checkController');
const auth = require('../controllers/authentication');
////////////////////////////////////////////////
Router.use(auth.protect);
Router.post('/complete/:checklistItemId', checkController.markCompleted);
Router.route('/')
  .get(auth.giveAccessTo('admin'), checkController.getAllChecks)
  .post(checkController.addCheck);
Router.route('/:id')
  .get(checkController.getCheckForTask)
  .patch(checkController.updateCheck)
  .delete(auth.protect, checkController.deleteCheck);
////////////////////////////////////////////////
module.exports = Router;
 */
