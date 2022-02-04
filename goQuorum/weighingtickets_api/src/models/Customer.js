const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: String,
  description: String,
  company_id: {
    type: String,
    unique: true
  },
  customerAdminAddress: {
    type: String,
    required: true
  },
  customerAdminNode: {
    type: String,
    required: true
  },
  customerAdminTesseraPublicKey: {
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

module.exports = mongoose.model('customer', CustomerSchema, 'customers');