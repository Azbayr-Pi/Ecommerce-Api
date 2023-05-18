const mongoose = require('./database');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;


async function genPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hash = await bcrypt.hashSync(password, salt);
    return { salt, hash };
}

async function validatePassword(password, hash, salt) {
    const match = await bcrypt.compareSync(password, hash);
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






