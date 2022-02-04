const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlacklistedTokenSchema = new Schema({
    token: {
      type: String,
      required: true
    },
    expiration: {
      type: Number,
      required: true
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      required: true
    },
    customer: {
      type: String,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_At'
    }
  });

module.exports = mongoose.model('blacklistedToken', BlacklistedTokenSchema, 'blacklistedTokens');