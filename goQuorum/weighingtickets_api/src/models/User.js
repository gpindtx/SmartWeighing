const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  customer: {
    type: String
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  address: String,
  node: String,
  tesseraPublicKey: String,
  first_pass: {
    type: Boolean,
    required: true,
    default: true
  },
  password_changed: {
    type: Boolean,
    required: true,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('user', UserSchema, 'users');