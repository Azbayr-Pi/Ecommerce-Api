const express = require('express');
const { showAllUsers, showUserById } = require('./usersController');

const usersRouter = express.Router();

usersRouter.get('/', showAllUsers);
usersRouter.get('/:id', showUserById);

module.exports = usersRouter;


