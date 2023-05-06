const express = require('express');
const categoriesRouter = express.Router();

const { getCategories, } = require('../categoriesController.js');

categoriesRouter.get('/', getCategories);


module.exports = categoriesRouter;





