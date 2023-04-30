const express = require('express');
const registerRouter = express.Router();
const path = require('path');
const User = require('../../config/usersSchema');
const { genPassword } = require('../../config/usersSchema');

registerRouter.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'register.html'));
});

registerRouter.post('/register', async (req, res, next ) => {
    const { username, password, email } = req.body; 
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required!' });
    }
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
        if (user.username === username) {
            return res.status(400).json({ message: 'Username is already taken' });
        } else if (user.email === email) {
            return res.status(400).json({ message: 'Email is already taken' });
        }
    }
    const hashedPass = await genPassword(password);
    const newUser = new User({
        username,
        salt: hashedPass.salt,
        hash: hashedPass.hash,
        email,
    });
    try {
        await newUser.save();
        req.logIn(newUser, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to log in user' });
            }
            return res.status(201).json({ message: ` ${newUser.username} you are successfully registered and logged in` });
        })
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = registerRouter;