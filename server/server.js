const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();
const File = require('./models/File');

const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // your React frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  next();
});

app.use(express.json());

// Multer setup for file storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Nodemailer transporter setup (Gmail SMTP example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// In-memory OTP store: { "<email>-<accessCode>": { otp, expiresAt } }
const otpStore = {};

// In-memory OTP store for registration: { "<email>": { otp, expiresAt } }
const registerOtpStore = {};

// In-memory OTP store for download: { "<email>-<accessCode>": { otp, expiresAt } }
const downloadOtpStore = {};

// Generate a 6-character alphanumeric code
function generateAccessCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate 6-digit numeric OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// JWT Authentication middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET missing from .env");
}

// Upload route (authenticated)
app.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    let accessCode;
    let isUnique = false;

    while (!isUnique) {
      accessCode = generateAccessCode();
      const existing = await File.findOne({ accessCode });
      if (!existing) isUnique = true;
    }

    const fileData = new File({
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs expiry
      accessCode,
      owner: req.user.userId  // Associate file with logged-in user
    });

    await fileData.save();

    res.status(200).json({
      message: 'File uploaded and saved!',
      filePath: `/uploads/${req.file.filename}`,
      accessCode
    });
  } catch (err) {
    console.error("Error saving to DB:", err);
    res.status(500).send('Error saving file info.');
  }
});

// Request OTP route (authenticated & owner-only)
app.post('/request-otp', authenticateJWT, async (req, res) => {
  const { email, accessCode } = req.body;
  if (!email || !accessCode) return res.status(400).json({ message: 'Email and accessCode required.' });

  try {
    const file = await File.findOne({ accessCode });
    if (!file) return res.status(404).json({ message: 'Invalid access code.' });
    if (file.expiresAt < new Date()) return res.status(410).json({ message: 'File link expired.' });

    if (file.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Generate OTP and expiry (5 minutes)
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore[`${email}-${accessCode}`] = { otp, expiresAt };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your VaultDrop OTP Code',
      text: `Your OTP code to access the file is: ${otp}. It expires in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error("OTP request error:", err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// Verify OTP route (authenticated)
app.post('/verify-otp', authenticateJWT, (req, res) => {
  const { email, accessCode, otp } = req.body;
  if (!email || !accessCode || !otp) return res.status(400).json({ message: 'Email, accessCode, and OTP required.' });

  const key = `${email}-${accessCode}`;
  const record = otpStore[key];

  if (!record) return res.status(400).json({ message: 'No OTP requested for this email and code.' });
  if (Date.now() > record.expiresAt) {
    delete otpStore[key];
    return res.status(410).json({ message: 'OTP expired.' });
  }
  if (record.otp !== otp) return res.status(401).json({ message: 'Invalid OTP.' });

  delete otpStore[key];
  res.json({ message: 'OTP verified successfully.' });
});

// Request OTP for download
app.post('/request-download-otp', authenticateJWT, async (req, res) => {
  const { email, accessCode } = req.body;
  if (!email || !accessCode) return res.status(400).json({ message: 'Email and accessCode required.' });
  try {
    const file = await File.findOne({ accessCode });
    if (!file) return res.status(404).json({ message: 'Invalid access code.' });
    if (file.expiresAt < new Date()) return res.status(410).json({ message: 'File link expired.' });
    // Generate OTP and expiry (5 minutes)
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    downloadOtpStore[`${email}-${accessCode}`] = { otp, expiresAt };
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your VaultDrop Download OTP',
      text: `Your OTP code to download the file is: ${otp}. It expires in 5 minutes.`
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Download OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// Verify OTP for download
app.post('/verify-download-otp', authenticateJWT, (req, res) => {
  const { email, accessCode, otp } = req.body;
  if (!email || !accessCode || !otp) return res.status(400).json({ message: 'Email, accessCode, and OTP required.' });
  const key = `${email}-${accessCode}`;
  const record = downloadOtpStore[key];
  if (!record) return res.status(400).json({ message: 'No OTP requested for this email and code.' });
  if (Date.now() > record.expiresAt) {
    delete downloadOtpStore[key];
    return res.status(410).json({ message: 'OTP expired.' });
  }
  if (record.otp !== otp) return res.status(401).json({ message: 'Invalid OTP.' });
  // Mark as verified for this session
  downloadOtpStore[key].verified = true;
  res.json({ message: 'OTP verified successfully.' });
});

// File preview endpoint (supports images, PDFs, text, etc.)
app.get('/preview/:id', authenticateJWT, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found.' });
    if (file.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const filePath = path.join(__dirname, file.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing from server.' });
    // Set appropriate content type for preview
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].includes(ext)) {
      res.type(ext);
    } else if ([".pdf"].includes(ext)) {
      res.type('application/pdf');
    } else if ([".txt", ".md", ".csv", ".log"].includes(ext)) {
      res.type('text/plain');
    } else {
      res.type('application/octet-stream');
    }
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ message: 'Failed to preview file.' });
  }
});

// Download history tracking: add a DownloadHistory model and log downloads
const DownloadHistory = mongoose.model('DownloadHistory', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  downloadedAt: { type: Date, default: Date.now },
  ip: String,
  email: String,
}));

// Update download endpoint to log history
app.get('/file/:code', authenticateJWT, async (req, res) => {
  const code = req.params.code;
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: 'Email required.' });
  const key = `${email}-${code}`;
  const record = downloadOtpStore[key];
  if (!record || !record.verified) return res.status(403).json({ message: 'OTP verification required.' });
  try {
    const file = await File.findOne({ accessCode: code });
    if (!file) return res.status(404).json({ message: 'File not found.' });
    if (file.expiresAt < new Date()) return res.status(410).json({ message: 'Link expired.' });
    const filePath = path.join(__dirname, file.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing from server.' });
    // Log download history
    await DownloadHistory.create({
      userId: req.user.userId,
      fileId: file._id,
      ip: req.ip,
      email,
    });
    // Clean up OTP after download
    delete downloadOtpStore[key];
    res.download(filePath, file.originalname);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: 'Error downloading file.' });
  }
});

// Get download history for user
app.get('/download-history', authenticateJWT, async (req, res) => {
  try {
    const history = await DownloadHistory.find({ userId: req.user.userId })
      .populate('fileId', 'originalname accessCode')
      .sort({ downloadedAt: -1 });
    res.json(history);
  } catch (err) {
    console.error('Download history error:', err);
    res.status(500).json({ message: 'Failed to fetch download history.' });
  }
});

// Pagination for /my-files
app.get('/my-files', authenticateJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await File.countDocuments({ owner: req.user.userId });
    const files = await File.find({ owner: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ files, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch files.' });
  }
});

// Admin analytics endpoints
app.get('/admin/analytics', authenticateJWT, async (req, res) => {
  // Only allow admin (add your own admin check logic)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();
    const totalDownloads = await DownloadHistory.countDocuments();
    const recentDownloads = await DownloadHistory.find().sort({ downloadedAt: -1 }).limit(10).populate('fileId', 'originalname');
    res.json({ totalUsers, totalFiles, totalDownloads, recentDownloads });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics.' });
  }
});

// Send OTP for registration
app.post('/send-register-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });

  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists.' });

    // Generate OTP and expiry (5 minutes)
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    registerOtpStore[email] = { otp, expiresAt };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your VaultDrop Registration OTP',
      text: `Your OTP code for registration is: ${otp}. It expires in 5 minutes.`
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Registration OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// User registration with OTP
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, otp } = req.body;
  if (!firstName || !lastName || !email || !password || !otp) return res.status(400).json({ message: 'First name, last name, email, password, and OTP required.' });

  try {
    // Check OTP
    const record = registerOtpStore[email];
    if (!record) return res.status(400).json({ message: 'No OTP requested for this email.' });
    if (Date.now() > record.expiresAt) {
      delete registerOtpStore[email];
      return res.status(410).json({ message: 'OTP expired.' });
    }
    if (record.otp !== otp) return res.status(401).json({ message: 'Invalid OTP.' });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists.' });

    user = new User({ firstName, lastName, email });
    await user.setPassword(password);
    await user.save();
    delete registerOtpStore[email];
    res.json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const valid = await user.validatePassword(password);  // Your User model should validate password here
    if (!valid) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed.' });
  }
});

app.get('/my-files', authenticateJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await File.countDocuments({ owner: req.user.userId });
    const files = await File.find({ owner: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ files, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch files.' });
  }
});

// Test email endpoint for debugging SMTP issues
app.post('/test-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'VaultDrop Test Email',
      text: 'This is a test email from your VaultDrop server.'
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Test email sent successfully.' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ message: 'Failed to send test email.', error: err.message, stack: err.stack });
  }
});

// Scheduled cleanup of expired files
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
async function cleanupExpiredFiles() {
  try {
    const now = new Date();
    const expiredFiles = await File.find({ expiresAt: { $lt: now } });
    for (const file of expiredFiles) {
      // Delete file from filesystem
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error('Failed to delete file from disk:', file.path, err);
      }
      // Remove from DB
      await File.deleteOne({ _id: file._id });
    }
    if (expiredFiles.length > 0) {
      console.log(`Cleaned up ${expiredFiles.length} expired files.`);
    }
  } catch (err) {
    console.error('Error during expired file cleanup:', err);
  }
}
setInterval(cleanupExpiredFiles, CLEANUP_INTERVAL_MS);

// Serve uploads folder statically (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User profile: get current user info
app.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      darkMode: user.darkMode,
      isAdmin: user.isAdmin
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
});

// User profile: update firstName, lastName, email or password
app.put('/profile', authenticateJWT, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use.' });
      user.email = email;
    }
    if (password) {
      await user.setPassword(password);
    }
    await user.save();
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// User profile: delete account
app.delete('/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Optionally, delete user's files here as well
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('Profile delete error:', err);
    res.status(500).json({ message: 'Failed to delete account.' });
  }
});

// Delete a file by ID (authenticated, owner only)
app.delete('/file/:id', authenticateJWT, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found.' });
    if (file.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    // Delete file from filesystem
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Failed to delete file from disk:', file.path, err);
    }
    await File.deleteOne({ _id: file._id });
    res.json({ message: 'File deleted successfully.' });
  } catch (err) {
    console.error('File delete error:', err);
    res.status(500).json({ message: 'Failed to delete file.' });
  }
});

// Multer/global error handler to always return JSON
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (file too large, too many files, etc)
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Other errors (including fileFilter)
    return res.status(400).json({ message: err.message || 'Upload error.' });
  }
  next();
});

// --- Configurable File Size/Type Restrictions ---
const FILE_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB default
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/plain',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const uploadWithRestrictions = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return cb(new Error('File type not allowed.'));
    }
    cb(null, true);
  }
});

// --- File Sharing Link Model (in-memory for demo, use DB for prod) ---
const sharingLinks = {}; // { linkId: { fileId, expiresAt, otpRequired, createdBy, otp, otpExpiresAt } }

function generateLinkId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// --- Create File Sharing Link (authenticated, owner only) ---
app.post('/share/:fileId', authenticateJWT, async (req, res) => {
  const { fileId } = req.params;
  const { expiresInMinutes = 60, otpRequired = false } = req.body;
  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found.' });
    if (file.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const linkId = generateLinkId();
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    let otp = null, otpExpiresAt = null;
    if (otpRequired) {
      otp = generateOTP();
      otpExpiresAt = Date.now() + 5 * 60 * 1000;
    }
    sharingLinks[linkId] = {
      fileId,
      expiresAt,
      otpRequired,
      createdBy: req.user.userId,
      otp,
      otpExpiresAt
    };
    res.json({ link: `/shared/${linkId}`, otp: otpRequired ? otp : undefined, expiresAt });
  } catch (err) {
    console.error('Share link error:', err);
    res.status(500).json({ message: 'Failed to create sharing link.' });
  }
});

// --- Access Shared File (with optional OTP) ---
app.post('/shared/:linkId', async (req, res) => {
  const { linkId } = req.params;
  const { otp } = req.body;
  const link = sharingLinks[linkId];
  if (!link) return res.status(404).json({ message: 'Link not found.' });
  if (Date.now() > link.expiresAt) return res.status(410).json({ message: 'Link expired.' });
  if (link.otpRequired) {
    if (!otp) return res.status(400).json({ message: 'OTP required.' });
    if (Date.now() > link.otpExpiresAt) return res.status(410).json({ message: 'OTP expired.' });
    if (otp !== link.otp) return res.status(401).json({ message: 'Invalid OTP.' });
  }
  try {
    const file = await File.findById(link.fileId);
    if (!file) return res.status(404).json({ message: 'File not found.' });
    const filePath = path.join(__dirname, file.path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing from server.' });
    res.download(filePath, file.originalname);
  } catch (err) {
    console.error('Shared file download error:', err);
    res.status(500).json({ message: 'Error downloading shared file.' });
  }
});

// --- Branding Config Endpoint ---
const brandingConfig = {
  logoUrl: '/uploads/vaultdrop-logo6.svg',
  themeColor: '#1a202c',
  appName: 'VaultDrop',
};
app.get('/branding', (req, res) => {
  res.json(brandingConfig);
});

// --- Dark Mode Preference (User Profile) ---
// Add darkMode to user profile (requires User model to support it)
app.put('/profile/darkmode', authenticateJWT, async (req, res) => {
  const { darkMode } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.darkMode = !!darkMode;
    await user.save();
    res.json({ message: 'Dark mode preference updated.' });
  } catch (err) {
    console.error('Dark mode update error:', err);
    res.status(500).json({ message: 'Failed to update dark mode.' });
  }
});

// --- Admin: List Users and Files ---
app.get('/admin/users', authenticateJWT, async (req, res) => {
  // Only allow admin (add isAdmin to User model for real use)
  // For demo, allow all
  try {
    const users = await User.find({}, 'firstName lastName email createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

app.get('/admin/files', authenticateJWT, async (req, res) => {
  // Only allow admin (add isAdmin to User model for real use)
  // For demo, allow all
  try {
    const files = await File.find({}, 'originalname filename owner size createdAt');
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch files.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
