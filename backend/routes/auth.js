import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const FIXED_PASSWORD = process.env.APP_PASSWORD || 'KidStar123';

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'kidstar_secret_change_in_production',
    { expiresIn: '30d' }
  );

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password !== FIXED_PASSWORD) {
      return res.status(401).json({ message: 'Please use the fixed app password' });
    }

    const user = {
      id: email.toLowerCase(),
      name: name.trim(),
      email: email.toLowerCase(),
    };
    const token = makeToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password !== FIXED_PASSWORD) {
      return res.status(401).json({ message: 'Incorrect fixed password' });
    }

    const user = {
      id: email.toLowerCase(),
      email: email.toLowerCase(),
      name: email.split('@')[0],
    };
    const token = makeToken(user);

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'kidstar_secret_change_in_production'
    );

    res.json({
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
      },
    });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

export default router;
