import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash });
  await user.save();
  res.status(201).json(user);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!user || !isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
  res.json({ token, user });
};
