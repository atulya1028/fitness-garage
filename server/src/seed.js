// Seeds placeholder plans and the trainers named in public Google reviews.
// Prices are intentionally left as "To be confirmed" until the gym provides them.
require('dotenv').config();
const mongoose = require('mongoose');
const { Plan, Trainer } = require('./models');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitness-garage');
  await Promise.all([Plan.deleteMany({}), Trainer.deleteMany({})]);
  await Plan.insertMany(
    ['Monthly', 'Quarterly', 'Half-yearly / Annual', 'Personal training add-on', 'Trial / day pass'].map((name, order) => ({
      name,
      order,
    }))
  );
  await Trainer.insertMany(
    [
      ['Himanshu', 'Often mentioned by members for personal-trainer-style support.'],
      ['Anil', 'Praised by members as supportive and encouraging.'],
      ['Pankaj', 'Praised by members as supportive and encouraging.'],
    ].map(([name, bio], order) => ({ name, bio, order }))
  );
  console.log('Seeded.');
  await mongoose.disconnect();
})();
