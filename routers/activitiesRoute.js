const express = require('express');
const Router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../controllers/authentication');
////////////////////////////////////////////////
Router.use(auth.protect);
Router.get('/', activityController.getActivity);
////////////////////////////////////////////////
module.exports = Router;
