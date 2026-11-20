require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { Lead, Plan, Trainer } = require('./models');

const app = express();
app.use(express.json({ limit: '50kb' }));
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const hostname = new URL(origin).hostname;
        if (
          allowedOrigins.length === 0 ||
          allowedOrigins.includes('*') ||
          allowedOrigins.includes(origin) ||
          hostname.endsWith('.onrender.com') ||
          hostname === 'localhost' ||
          hostname === '127.0.0.1'
        ) {
          return callback(null, true);
        }
      } catch {}
      return callback(null, false);
    },
    credentials: true,
  })
);

// ---- admin auth (constant-time token compare) ----
function admin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN || '';
  const given = String(req.get('x-admin-token') || '');
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/', (_req, res) => res.json({ message: 'The Fitness Garage API is running.', status: 'OK' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---- public ----
app.get('/api/content', async (_req, res, next) => {
  try {
    const [plans, trainers] = await Promise.all([
      Plan.find().sort({ order: 1 }).lean(),
      Trainer.find().sort({ order: 1 }).lean(),
    ]);
    res.json({ plans, trainers });
  } catch (e) {
    next(e);
  }
});

const leadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

app.post('/api/leads', leadLimiter, async (req, res, next) => {
  try {
    const { name, phone, goal, slot } = req.body || {};
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '');
    if (!String(name || '').trim() || cleanPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Please enter your name and a valid phone number.' });
    }
    await Lead.create({
      name: String(name).slice(0, 80),
      phone: cleanPhone.slice(0, 20),
      goal: String(goal || '').slice(0, 60),
      slot: String(slot || '').slice(0, 60),
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- admin ----
app.get('/api/admin/leads', admin, async (_req, res, next) => {
  try {
    res.json(await Lead.find().sort({ createdAt: -1 }).limit(500).lean());
  } catch (e) {
    next(e);
  }
});

app.patch('/api/admin/leads/:id', admin, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { contacted: !!req.body.contacted }, { new: true });
    res.json(lead);
  } catch (e) {
    next(e);
  }
});

function crud(path, Model, fields) {
  const pick = (body) => Object.fromEntries(fields.filter((f) => f in body).map((f) => [f, body[f]]));
  app.post(`/api/admin/${path}`, admin, async (req, res, next) => {
    try {
      res.status(201).json(await Model.create(pick(req.body || {})));
    } catch (e) {
      next(e);
    }
  });
  app.put(`/api/admin/${path}/:id`, admin, async (req, res, next) => {
    try {
      res.json(await Model.findByIdAndUpdate(req.params.id, pick(req.body || {}), { new: true, runValidators: true }));
    } catch (e) {
      next(e);
    }
  });
  app.delete(`/api/admin/${path}/:id`, admin, async (req, res, next) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });
}
crud('plans', Plan, ['name', 'price', 'note', 'order']);
crud('trainers', Trainer, ['name', 'bio', 'photoUrl', 'order']);

// ---- errors ----
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

const port = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitness-garage')
  .then(() => app.listen(port, () => console.log(`API listening on :${port}`)))
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });

module.exports = app;
