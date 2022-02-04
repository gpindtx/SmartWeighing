const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  latitude: String,
  longitude: String,
  description: String,
  customer: {
    type: mongoose.Types.ObjectId,
    ref: 'customer',
    required: true
  },
  contractAddress: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  node: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  tesseraPublicKey: {
    type: String,
    required: true
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

module.exports = mongoose.model('station', StationSchema, 'stations');