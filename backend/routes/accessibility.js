const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/accessibility/text-to-speech
 * @desc    Convert text to speech (returns speech config)
 * @access  Private
 */
router.post('/text-to-speech', protect, async (req, res) => {
  try {
    const { text, language = 'en-IN', speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text to convert'
      });
    }

    // In production, this would call a TTS service
    // For now, we return config for Web Speech API on frontend
    res.json({
      success: true,
      data: {
        text,
        config: {
          lang: language,
          rate: speed,
          pitch: 1.0,
          volume: 1.0
        }
      }
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing text-to-speech'
    });
  }
});

/**
 * @route   POST /api/accessibility/voice-command
 * @desc    Process voice command
 * @access  Private
 */
router.post('/voice-command', protect, async (req, res) => {
  try {
    const { command, context } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a voice command'
      });
    }

    // Parse command and return action
    const action = parseVoiceCommand(command.toLowerCase());

    res.json({
      success: true,
      data: {
        command,
        action,
        response: generateVoiceResponse(action)
      }
    });
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing voice command'
    });
  }
});

/**
 * @route   GET /api/accessibility/screen-reader-content
 * @desc    Get optimized content for screen readers
 * @access  Private
 */
router.get('/screen-reader-content', protect, async (req, res) => {
  try {
    const { section } = req.query;

    const content = {
      dashboard: {
        title: 'Dashboard',
        description: `Welcome ${req.user.name}. Your current balance is ${req.user.balance} rupees.`,
        actions: [
          'Navigate to send money',
          'View recent transactions',
          'Check balance',
          'Access settings'
        ]
      },
      sendMoney: {
        title: 'Send Money',
        description: 'Enter recipient UPI ID and amount to send money',
        fields: [
          { name: 'recipientUpiId', label: 'Recipient UPI ID', required: true },
          { name: 'amount', label: 'Amount in rupees', required: true },
          { name: 'description', label: 'Description (optional)', required: false }
        ]
      }
    };

    res.json({
      success: true,
      data: content[section] || { error: 'Section not found' }
    });
  } catch (error) {
    console.error('Screen reader content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching screen reader content'
    });
  }
});

/**
 * @route   GET /api/accessibility/voice-prompts
 * @desc    Get voice prompts for current screen
 * @access  Private
 */
router.get('/voice-prompts', protect, async (req, res) => {
  try {
    const { screen } = req.query;

    const prompts = {
      login: [
        'Welcome to accessible UPI. Please say login to continue.',
        'You can also say register to create a new account.'
      ],
      dashboard: [
        `Hello ${req.user.name}. Your balance is ${req.user.balance} rupees.`,
        'Say send money to make a payment.',
        'Say show transactions to view recent activity.',
        'Say help to hear available commands.'
      ],
      sendMoney: [
        'You are on the send money screen.',
        'Please say the recipient UPI ID.',
        'Then say the amount you want to send.',
        'Finally, confirm the transaction.'
      ],
      confirmation: [
        'Please confirm your transaction.',
        'Say yes to proceed or cancel to go back.'
      ]
    };

    res.json({
      success: true,
      data: {
        prompts: prompts[screen] || ['No prompts available for this screen']
      }
    });
  } catch (error) {
    console.error('Voice prompts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voice prompts'
    });
  }
});

/**
 * @route   POST /api/accessibility/error-assistance
 * @desc    Get assistance for errors
 * @access  Private
 */
router.post('/error-assistance', protect, async (req, res) => {
  try {
    const { errorType, errorMessage, userInput } = req.body;

    const assistance = generateErrorAssistance(errorType, errorMessage, userInput);

    res.json({
      success: true,
      data: assistance
    });
  } catch (error) {
    console.error('Error assistance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating assistance'
    });
  }
});

/**
 * Helper: Parse voice command
 */
function parseVoiceCommand(command) {
  const commandMap = {
    'send money': { action: 'navigate', target: '/send-money' },
    'show balance': { action: 'show', target: 'balance' },
    'show transactions': { action: 'navigate', target: '/transactions' },
    'recent transactions': { action: 'navigate', target: '/transactions' },
    'go back': { action: 'navigate', target: 'back' },
    'help': { action: 'show', target: 'help' },
    'settings': { action: 'navigate', target: '/settings' },
    'high contrast': { action: 'toggle', target: 'highContrast' },
    'enable voice': { action: 'toggle', target: 'voiceNavigation' },
    'disable voice': { action: 'toggle', target: 'voiceNavigation', value: false },
    'repeat': { action: 'repeat' },
    'confirm': { action: 'confirm' },
    'cancel': { action: 'cancel' }
  };

  for (const [key, value] of Object.entries(commandMap)) {
    if (command.includes(key)) {
      return value;
    }
  }

  return { action: 'unknown', command };
}

/**
 * Helper: Generate voice response
 */
function generateVoiceResponse(action) {
  const responses = {
    navigate: 'Navigating',
    show: 'Showing',
    toggle: 'Toggling setting',
    repeat: 'Repeating previous message',
    confirm: 'Confirming action',
    cancel: 'Cancelling',
    unknown: 'Sorry, I did not understand that command. Say help for available commands.'
  };

  return responses[action.action] || responses.unknown;
}

/**
 * Helper: Generate error assistance
 */
function generateErrorAssistance(errorType, errorMessage, userInput) {
  const assistanceMap = {
    'validation': {
      message: 'The information you entered needs to be corrected',
      steps: [
        'Check that your UPI ID is in the correct format: username@bankname',
        'Make sure the amount is a valid number',
        'Verify all required fields are filled'
      ],
      voiceGuidance: 'There was a validation error. Please check your input and try again.'
    },
    'insufficient_balance': {
      message: 'You do not have enough balance for this transaction',
      steps: [
        'Your current balance is insufficient',
        'Please add money to your account',
        'Or try a smaller amount'
      ],
      voiceGuidance: 'Insufficient balance. Please add money or reduce the amount.',
      suggestedActions: ['Check balance', 'Reduce amount']
    },
    'network': {
      message: 'There was a network error',
      steps: [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the problem persists'
      ],
      voiceGuidance: 'Network error. Please check your connection and try again.'
    },
    'timeout': {
      message: 'The request timed out',
      steps: [
        'The transaction took too long',
        'Your money is safe',
        'Please check your transaction history'
      ],
      voiceGuidance: 'Request timed out. Your money is safe. Check transaction history.'
    }
  };

  return assistanceMap[errorType] || {
    message: 'An error occurred',
    steps: ['Please try again', 'Contact support if the problem persists'],
    voiceGuidance: 'An error occurred. Please try again.'
  };
}

module.exports = router;