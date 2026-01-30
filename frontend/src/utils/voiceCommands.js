// src/utils/voiceCommands.js
export const parseVoiceCommand = (text) => {
  if (text.includes('send money')) {
    return { action: 'NAVIGATE', target: '/send-money' };
  }

  if (text.includes('show transactions') || text.includes('transactions')) {
    return { action: 'NAVIGATE', target: '/transactions' };
  }

  if (text.includes('show balance') || text.includes('balance')) {
    return { action: 'SHOW_BALANCE' };
  }

  if (text.includes('dashboard') || text.includes('home')) {
    return { action: 'NAVIGATE', target: '/dashboard' };
  }

  if (text.includes('settings')) {
    return { action: 'NAVIGATE', target: '/settings' };
  }

  if (text.includes('fraud') || text.includes('alerts')) {
    return { action: 'NAVIGATE', target: '/fraud-alerts' };
  }

  if (text.includes('trusted contacts') || text.includes('contacts')) {
    return { action: 'NAVIGATE', target: '/trusted-contacts' };
  }

  if (text.includes('logout') || text.includes('log out')) {
    return { action: 'LOGOUT' };
  }

  if (text.includes('go back') || text.includes('back')) {
    return { action: 'BACK' };
  }

  if (text.includes('help')) {
    return { action: 'HELP' };
  }

  if (text.includes('confirm')) {
    return { action: 'CONFIRM_TRANSACTION' };
  }

  if (text.includes('cancel')) {
    return { action: 'CANCEL_TRANSACTION' };
  }

  return { action: 'UNKNOWN' };
};

