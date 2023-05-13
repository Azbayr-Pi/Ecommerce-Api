const User = require('../../config/usersSchema');

const showAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, {_id: 0, hash: 0, salt: 0, __v: 0});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }   
}

const showUserById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id, {_id: 0, hash: 0, salt: 0, __v: 0});
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User does not exist" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    showAllUsers,
    showUserById
}