const mongoose = require('mongoose');

const Lead = mongoose.model(
  'Lead',
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 80 },
      phone: { type: String, required: true, trim: true, maxlength: 20 },
      goal: { type: String, trim: true, maxlength: 60 },
      slot: { type: String, trim: true, maxlength: 60 },
      contacted: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

const Plan = mongoose.model(
  'Plan',
  new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: String, default: 'To be confirmed' },
    note: { type: String, default: '' },
    order: { type: Number, default: 0 },
  })
);

const Trainer = mongoose.model(
  'Trainer',
  new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
  })
);

module.exports = { Lead, Plan, Trainer };
