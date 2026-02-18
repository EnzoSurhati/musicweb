const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'devjwtsecret';

// Stripe and Resend are optional — app works without them in dev
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── DB INIT ──────────────────────────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        artist VARCHAR(150) NOT NULL,
        genre VARCHAR(80),
        year INTEGER,
        price NUMERIC(10,2) NOT NULL,
        cover_url TEXT,
        description TEXT,
        tracks INTEGER DEFAULT 10,
        rating NUMERIC(2,1) DEFAULT 4.0,
        featured BOOLEAN DEFAULT FALSE,
        new_release BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        UNIQUE(user_id, album_id)
      );

      CREATE TABLE IF NOT EXISTS saved_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        UNIQUE(user_id, album_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_intent_id VARCHAR(255),
        billing_name VARCHAR(200),
        billing_email VARCHAR(200),
        billing_address TEXT,
        billing_city VARCHAR(100),
        billing_state VARCHAR(100),
        billing_zip VARCHAR(20),
        billing_country VARCHAR(100) DEFAULT 'US',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albums(id),
        quantity INTEGER,
        price NUMERIC(10,2)
      );
    `);

    // Add billing columns to existing orders table if they don't exist
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_name VARCHAR(200);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_email VARCHAR(200);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_state VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_country VARCHAR(100) DEFAULT 'US';
    `);

    const { rows } = await client.query('SELECT COUNT(*) FROM albums');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO albums (title, artist, genre, year, price, cover_url, description, tracks, rating, featured, new_release) VALUES
        ('Midnight Frequencies', 'Luna Echo', 'Synthwave', 2024, 18.99, 'https://picsum.photos/seed/album1/400/400', 'A haunting journey through neon-lit soundscapes and pulsing electronic beats.', 12, 4.8, true, true),
        ('The Velvet Underground Sessions', 'Phantom Silk', 'Indie Rock', 2024, 16.99, 'https://picsum.photos/seed/album2/400/400', 'Raw, emotional indie rock that captures the spirit of underground music.', 11, 4.6, true, true),
        ('Solar Drift', 'Cosmo Ray', 'Ambient', 2023, 14.99, 'https://picsum.photos/seed/album3/400/400', 'Floating soundscapes perfect for late-night contemplation.', 8, 4.5, true, false),
        ('Neon Jungle', 'The Pixelators', 'Electronic', 2024, 19.99, 'https://picsum.photos/seed/album4/400/400', 'High-energy electronic music that blends organic and digital worlds.', 14, 4.7, false, true),
        ('Crimson Tide', 'Axel Voss', 'Heavy Metal', 2023, 17.99, 'https://picsum.photos/seed/album5/400/400', 'Thunderous riffs and soaring vocals from the next generation of metal.', 10, 4.4, false, false),
        ('Blue Monday Sessions', 'The Jazz Collective', 'Jazz', 2023, 15.99, 'https://picsum.photos/seed/album6/400/400', 'Modern jazz with a nod to the golden era, recorded live in one take.', 9, 4.9, true, false),
        ('Digital Dreams', 'Cyber Muse', 'Synthpop', 2024, 16.99, 'https://picsum.photos/seed/album7/400/400', 'Catchy synth hooks and dreamy vocals that transport you to another dimension.', 11, 4.3, false, true),
        ('Roots & Echoes', 'Tierra Sol', 'Folk', 2023, 13.99, 'https://picsum.photos/seed/album8/400/400', 'Heartfelt folk stories accompanied by acoustic guitar and harmonica.', 12, 4.6, false, false),
        ('Storm Protocol', 'Voltage', 'Drum & Bass', 2024, 18.99, 'https://picsum.photos/seed/album9/400/400', 'Brain-rattling bass and rapid-fire drums for the warehouse generation.', 15, 4.5, false, true),
        ('Ivory Keys', 'Maren Wells', 'Classical', 2023, 14.99, 'https://picsum.photos/seed/album10/400/400', 'Solo piano compositions that speak to the depth of human emotion.', 8, 4.8, true, false),
        ('City Lights', 'Nora Blue', 'R&B', 2024, 17.99, 'https://picsum.photos/seed/album11/400/400', 'Smooth R&B grooves with lyrics about modern love and city life.', 13, 4.7, false, true),
        ('Fractured Sky', 'Post Signal', 'Post-Rock', 2023, 16.99, 'https://picsum.photos/seed/album12/400/400', 'Cinematic post-rock that builds from whispers to towering crescendos.', 7, 4.9, true, false),
        ('Summer Static', 'Beach Riot', 'Indie Pop', 2024, 15.99, 'https://picsum.photos/seed/album13/400/400', 'Hazy, sun-drenched indie pop for golden hour playlists.', 11, 4.4, false, true),
        ('Bass Theory', 'Deep Protocol', 'Hip Hop', 2023, 19.99, 'https://picsum.photos/seed/album14/400/400', 'Hard-hitting beats and poetic lyricism from the streets to the clouds.', 16, 4.6, false, false),
        ('Quantum State', 'Void Walker', 'IDM', 2024, 16.99, 'https://picsum.photos/seed/album15/400/400', 'Intricate rhythms and alien textures for adventurous listeners.', 10, 4.5, false, true),
        ('Hearth', 'Ember & Ash', 'Acoustic', 2023, 13.99, 'https://picsum.photos/seed/album16/400/400', 'Warm acoustic recordings that feel like a fireside conversation.', 9, 4.7, false, false)
      `);
    }
    console.log('✅ Database initialized');
  } finally {
    client.release();
  }
}

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── EMAIL HELPER ─────────────────────────────────────────────────────────────
async function sendOrderConfirmationEmail(order, user, items) {
  if (!resend) {
    console.log('📧 [DEV] Email would be sent to:', user.email, '- Order #' + order.id);
    return;
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="60">
              <img src="${item.cover_url}" width="56" height="56" style="border-radius:4px;display:block;object-fit:cover;" />
            </td>
            <td style="padding-left:14px;">
              <div style="font-weight:600;color:#f0ede8;font-size:14px;">${item.title}</div>
              <div style="color:#888;font-size:12px;margin-top:3px;">${item.artist}</div>
              <div style="color:#888;font-size:12px;">Qty: ${item.quantity}</div>
            </td>
            <td align="right" style="font-family:monospace;color:#e8d5a3;font-size:14px;white-space:nowrap;">
              $${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:32px;" align="center">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#e8d5a3;border-radius:50%;width:40px;height:40px;text-align:center;line-height:40px;font-size:18px;">🎵</td>
                <td style="padding-left:12px;font-size:22px;font-weight:800;color:#f0ede8;letter-spacing:0.1em;">WAXROOM</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Confirmation box -->
        <tr>
          <td style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:40px;border-top:3px solid #e8d5a3;">

            <div style="font-size:12px;font-family:monospace;color:#e8d5a3;letter-spacing:0.15em;margin-bottom:8px;">ORDER CONFIRMED</div>
            <h1 style="margin:0 0 8px;color:#f0ede8;font-size:28px;font-weight:800;">Thanks, ${user.name.split(' ')[0]}!</h1>
            <p style="color:#888;font-size:14px;margin:0 0 32px;line-height:1.6;">
              Your order has been placed and payment confirmed. Your music is ready to enjoy.
            </p>

            <!-- Order meta -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:6px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px;border-right:1px solid #2a2a2a;" width="50%">
                  <div style="font-size:11px;font-family:monospace;color:#555;letter-spacing:0.1em;margin-bottom:6px;">ORDER NUMBER</div>
                  <div style="font-size:16px;font-weight:700;color:#e8d5a3;font-family:monospace;">#${String(order.id).padStart(6, '0')}</div>
                </td>
                <td style="padding:20px;" width="50%">
                  <div style="font-size:11px;font-family:monospace;color:#555;letter-spacing:0.1em;margin-bottom:6px;">ORDER DATE</div>
                  <div style="font-size:14px;color:#f0ede8;">${new Date(order.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
                </td>
              </tr>
            </table>

            <!-- Items -->
            <div style="font-size:11px;font-family:monospace;color:#555;letter-spacing:0.1em;margin-bottom:16px;">YOUR ALBUMS</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemsHtml}
            </table>

            <!-- Total -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;padding-top:20px;border-top:1px solid #2a2a2a;">
              <tr>
                <td style="color:#888;font-size:13px;">Subtotal</td>
                <td align="right" style="color:#f0ede8;font-family:monospace;">$${parseFloat(order.total).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:13px;padding-top:8px;">Tax</td>
                <td align="right" style="color:#f0ede8;font-family:monospace;padding-top:8px;">$0.00</td>
              </tr>
              <tr>
                <td style="font-size:16px;font-weight:700;color:#f0ede8;padding-top:16px;border-top:1px solid #2a2a2a;">Total Charged</td>
                <td align="right" style="font-size:20px;font-weight:800;color:#e8d5a3;font-family:monospace;padding-top:16px;border-top:1px solid #2a2a2a;">$${parseFloat(order.total).toFixed(2)}</td>
              </tr>
            </table>

            <!-- Billing address -->
            ${order.billing_address ? `
            <div style="margin-top:28px;padding-top:28px;border-top:1px solid #2a2a2a;">
              <div style="font-size:11px;font-family:monospace;color:#555;letter-spacing:0.1em;margin-bottom:12px;">BILLED TO</div>
              <div style="color:#f0ede8;font-size:14px;line-height:1.8;">
                ${order.billing_name}<br>
                ${order.billing_address}<br>
                ${order.billing_city}, ${order.billing_state} ${order.billing_zip}<br>
                ${order.billing_country}
              </div>
            </div>
            ` : ''}

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 0;text-align:center;">
            <p style="color:#444;font-size:12px;margin:0;">
              Questions? Reply to this email.<br>
              © 2024 WAXROOM — Premium Music Store
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'orders@waxroom.store',
      to: user.email,
      subject: `Order Confirmed — #${String(order.id).padStart(6, '0')} | WAXROOM`,
      html,
    });
    console.log('📧 Confirmation email sent to', user.email);
  } catch (e) {
    console.error('📧 Email send failed:', e.message);
  }
}

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashed]
    );
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: rows[0], token });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows[0]) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: rows[0].id, name: rows[0].name, email: rows[0].email }, token });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
  res.json(rows[0]);
});

app.put('/api/auth/me', auth, async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING id, name, email',
      [name, email, req.user.id]
    );
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ALBUM ROUTES ─────────────────────────────────────────────────────────────
app.get('/api/albums', async (req, res) => {
  const { genre, search, sort, featured, new_release } = req.query;
  let q = 'SELECT * FROM albums WHERE 1=1';
  const params = [];
  if (genre) { params.push(genre); q += ` AND genre = $${params.length}`; }
  if (search) { params.push(`%${search}%`); q += ` AND (title ILIKE $${params.length} OR artist ILIKE $${params.length})`; }
  if (featured === 'true') q += ' AND featured = true';
  if (new_release === 'true') q += ' AND new_release = true';
  if (sort === 'price_asc') q += ' ORDER BY price ASC';
  else if (sort === 'price_desc') q += ' ORDER BY price DESC';
  else if (sort === 'rating') q += ' ORDER BY rating DESC';
  else q += ' ORDER BY id ASC';
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

app.get('/api/albums/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM albums WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

app.get('/api/genres', async (req, res) => {
  const { rows } = await pool.query('SELECT DISTINCT genre FROM albums ORDER BY genre');
  res.json(rows.map(r => r.genre));
});

// ─── CART ROUTES ──────────────────────────────────────────────────────────────
app.get('/api/cart', auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ci.id, ci.quantity, a.* FROM cart_items ci
     JOIN albums a ON ci.album_id = a.id WHERE ci.user_id = $1`,
    [req.user.id]
  );
  res.json(rows);
});

app.post('/api/cart', auth, async (req, res) => {
  const { album_id, quantity = 1 } = req.body;
  await pool.query(
    `INSERT INTO cart_items (user_id, album_id, quantity) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, album_id) DO UPDATE SET quantity = cart_items.quantity + $3`,
    [req.user.id, album_id, quantity]
  );
  res.json({ success: true });
});

app.put('/api/cart/:albumId', auth, async (req, res) => {
  const { quantity } = req.body;
  if (quantity <= 0) {
    await pool.query('DELETE FROM cart_items WHERE user_id=$1 AND album_id=$2', [req.user.id, req.params.albumId]);
  } else {
    await pool.query('UPDATE cart_items SET quantity=$1 WHERE user_id=$2 AND album_id=$3', [quantity, req.user.id, req.params.albumId]);
  }
  res.json({ success: true });
});

app.delete('/api/cart/:albumId', auth, async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id=$1 AND album_id=$2', [req.user.id, req.params.albumId]);
  res.json({ success: true });
});

app.delete('/api/cart', auth, async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
  res.json({ success: true });
});

// ─── SAVED ROUTES ─────────────────────────────────────────────────────────────
app.get('/api/saved', auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT si.id, a.* FROM saved_items si JOIN albums a ON si.album_id = a.id WHERE si.user_id = $1`,
    [req.user.id]
  );
  res.json(rows);
});

app.post('/api/saved/:albumId', auth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO saved_items (user_id, album_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.albumId]
    );
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/saved/:albumId', auth, async (req, res) => {
  await pool.query('DELETE FROM saved_items WHERE user_id=$1 AND album_id=$2', [req.user.id, req.params.albumId]);
  res.json({ success: true });
});

// ─── STRIPE PAYMENT INTENT ────────────────────────────────────────────────────
app.post('/api/payments/create-intent', auth, async (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to docker-compose.yml' });

  const { rows: cartItems } = await pool.query(
    `SELECT ci.quantity, a.price FROM cart_items ci
     JOIN albums a ON ci.album_id = a.id WHERE ci.user_id = $1`,
    [req.user.id]
  );

  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  const total = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const amountInCents = Math.round(total * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: req.user.id },
    });
    res.json({ client_secret: paymentIntent.client_secret, amount: total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ORDER ROUTES ─────────────────────────────────────────────────────────────
app.get('/api/orders', auth, async (req, res) => {
  const { rows: orders } = await pool.query(
    'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]
  );
  for (const order of orders) {
    const { rows: items } = await pool.query(
      `SELECT oi.*, a.title, a.artist, a.cover_url FROM order_items oi
       JOIN albums a ON oi.album_id = a.id WHERE oi.order_id = $1`,
      [order.id]
    );
    order.items = items;
  }
  res.json(orders);
});

app.get('/api/orders/:id', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
  const order = rows[0];
  const { rows: items } = await pool.query(
    `SELECT oi.*, a.title, a.artist, a.cover_url, a.genre FROM order_items oi
     JOIN albums a ON oi.album_id = a.id WHERE oi.order_id = $1`,
    [order.id]
  );
  order.items = items;
  res.json(order);
});

// Main checkout endpoint — called after Stripe payment succeeds (or directly in dev mode)
app.post('/api/orders', auth, async (req, res) => {
  const { payment_intent_id, billing } = req.body;
  const client = await pool.connect();

  try {
    // If Stripe is configured, verify the payment intent succeeded
    if (stripe && payment_intent_id) {
      const intent = await stripe.paymentIntents.retrieve(payment_intent_id);
      if (intent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not confirmed' });
      }
    }

    await client.query('BEGIN');

    const { rows: cartItems } = await client.query(
      `SELECT ci.quantity, a.id as album_id, a.price, a.title, a.artist, a.cover_url
       FROM cart_items ci JOIN albums a ON ci.album_id = a.id WHERE ci.user_id = $1`,
      [req.user.id]
    );

    if (!cartItems.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

    const { rows: [order] } = await client.query(
      `INSERT INTO orders (
        user_id, total, status, stripe_payment_intent_id,
        billing_name, billing_email, billing_address,
        billing_city, billing_state, billing_zip, billing_country
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        req.user.id,
        total,
        stripe && payment_intent_id ? 'completed' : 'completed',
        payment_intent_id || null,
        billing?.name || null,
        billing?.email || null,
        billing?.address || null,
        billing?.city || null,
        billing?.state || null,
        billing?.zip || null,
        billing?.country || 'US',
      ]
    );

    for (const item of cartItems) {
      await client.query(
        'INSERT INTO order_items (order_id, album_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.album_id, item.quantity, item.price]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    await client.query('COMMIT');

    // Get full user info for email
    const { rows: [user] } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail(order, user, cartItems).catch(console.error);

    // Return full order with items
    order.items = cartItems;
    res.json(order);

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Order error:', e);
    res.status(500).json({ error: 'Order failed: ' + e.message });
  } finally {
    client.release();
  }
});

// ─── STRIPE PUBLISHABLE KEY ───────────────────────────────────────────────────
app.get('/api/payments/config', (req, res) => {
  res.json({ publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || null });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', stripe: !!stripe, email: !!resend }));

initDB().then(() => {
  app.listen(PORT, () => console.log(`🎵 MusicStore API running on port ${PORT} | Stripe: ${stripe ? '✅' : '❌ (add key)'} | Email: ${resend ? '✅' : '❌ (add key)'}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
