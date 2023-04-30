const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const conn = "mongodb://127.0.0.1:27017/Ecommerce-Api";

mongoose.connect(conn)
    .then(() => {
        console.log('Connected to database');
        console.log(conn);
    })
    .catch((err) => {
        console.log('Failed to connect to database', err);
    });

const { Schema } = mongoose;


async function genPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
}

async function validatePassword(password, hash, salt) {
    const match = await bcrypt.compare(password, hash);
    return match;
}

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    }, 
    salt: String,
    hash: String,
    email: {
        type: String,
        required: true,
        uniqie: true,
    },
    products: {
        required: false,
        type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },
    orders: {
        required: false,
        type: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    }
})
 
userSchema.pre('save', async function (next) {
    try {
      if (!this.isModified('password')) return next();

      const { salt, hash } = await genPassword(this.password);
      this.hash = hash;
      this.salt = salt;
  
      return next();
    } catch (err) {
      return next(err);
    }
});
  
userSchema.methods.isValidPassword = async function (password) {
    try {
      const isValid = await validatePassword(password, this.hash, this.salt);
      return isValid;
    } catch (err) {
      console.log(err);
      return false;
    }
};
  
  

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.genPassword = genPassword;






