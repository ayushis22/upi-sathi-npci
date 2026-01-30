const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, sendTokenResponse } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, disabilityProfile, accessibilitySettings } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate UPI ID
    const upiId = `${email.split('@')[0]}@upi`;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      upiId,
      disabilityProfile: disabilityProfile || {},
      accessibilitySettings: accessibilitySettings || {}
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phoneNumber) fieldsToUpdate.phoneNumber = phoneNumber;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

/**
 * @route   PUT /api/auth/accessibility-settings
 * @desc    Update accessibility settings
 * @access  Private
 */
router.put('/accessibility-settings', protect, async (req, res) => {
  try {
    const { accessibilitySettings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { accessibilitySettings } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Accessibility settings updated successfully',
      data: user.accessibilitySettings
    });
  } catch (error) {
    console.error('Update accessibility settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating accessibility settings'
    });
  }
});

/**
 * @route   PUT /api/auth/security-settings
 * @desc    Update security settings
 * @access  Private
 */
router.put('/security-settings', protect, async (req, res) => {
  try {
    const { securitySettings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { securitySettings } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: user.securitySettings
    });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating security settings'
    });
  }
});

/**
 * @route   GET /api/auth/balance
 * @desc    Get user balance
 * @access  Private
 */
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance upiId');

    res.json({
      success: true,
      data: {
        balance: user.balance,
        upiId: user.upiId
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching balance'
    });
  }
});

/**
 * @route   POST /api/auth/freeze-account
 * @desc    Emergency account freeze
 * @access  Private
 */
router.post('/freeze-account', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { accountStatus: 'frozen' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Account frozen successfully for your safety',
      data: {
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Freeze account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error freezing account'
    });
  }
});

module.exports = router;