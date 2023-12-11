const express = require('express');
const Router = express.Router();
const userController = require('../controllers/userController');
const taskController = require('../controllers/taskController');
const auth = require('../controllers/authentication');
////////////////////////////////////////////////
//For user
Router.post('/signup', auth.signUp);
Router.post('/login', auth.login);
Router.post('/forget-password', auth.forgetPassword);
Router.post('/rest-password/:code', auth.resetPassword);
Router.use(auth.protect); /////////////////////////////////////////////////////////
Router.post('/update-password', auth.updatePassword);
Router.get('/me', userController.getMe, userController.getUser);
Router.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.resizePhoto,
  userController.updateMe
);
Router.patch('/delete-me', userController.deleteMe);
Router.get('/find-members', userController.getUsers);
///////////////////////////////////////////////////////////////////////////
//For Adminstration
Router.route('/').get(auth.giveAccessTo('admin'), userController.getUsers);
Router.route('/:id')
  .get(auth.giveAccessTo('admin'), userController.getUser)
  .patch(auth.giveAccessTo('admin'), userController.updateUser)
  .delete(auth.giveAccessTo('admin'), userController.deleteUser);
////////////////////////////////////////////////
module.exports = Router;
