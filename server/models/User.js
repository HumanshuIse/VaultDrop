const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  darkMode: { type: Boolean, default: false }, // For dark mode preference
  isAdmin: { type: Boolean, default: false }, // For admin support (future use)
});


userSchema.methods.setPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};


module.exports = mongoose.model('User', userSchema);
