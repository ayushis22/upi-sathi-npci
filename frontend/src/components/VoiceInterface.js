// src/components/VoiceInterface.js
import React, { useEffect, useRef, useState } from 'react';
import { useVoice } from '../hooks/useVoice';
import { parseVoiceCommand } from '../utils/voiceCommands';
import { toast } from 'react-toastify';
import { useAccessibility } from '../contexts/AllContexts';

const parseAmount = (text) => {
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  return parseFloat(match[1]);
};

const normalizeRecipient = (text) => {
  const cleaned = text
    .replace(/(to\s+)?send money to/i, '')
    .replace(/^to\s+/i, '')
    .trim();
  if (!cleaned) return '';
  if (cleaned.includes('@')) return cleaned;
  return `${cleaned.replace(/\s+/g, '').toLowerCase()}@upi`;
};

const VoiceInterface = ({ onAction }) => {
  const { settings, speak } = useAccessibility();
  const [flow, setFlow] = useState({
    step: 'idle',
    recipientUpiId: '',
    amount: ''
  });
  const flowRef = useRef({
    step: 'idle',
    recipientUpiId: '',
    amount: ''
  });
  const lastPromptRef = useRef('');
  const [lastPrompt, setLastPrompt] = useState('');
  const autoStartedRef = useRef(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const isSpeakingRef = useRef(false);
  const resumeTimeoutRef = useRef(null);

  const say = (message) => {
    lastPromptRef.current = message;
    setLastPrompt(message);
    toast.info(message);
    if (!settings.enableVoiceNavigation) return;
    // Pause recognition while speaking to avoid self-capture.
    stopListening({ temporary: true });
    isSpeakingRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      isSpeakingRef.current = false;
      try {
        startListening();
      } catch (e) {
        // ignore
      }
    }, 1500);

    if (!('speechSynthesis' in window)) {
      speak(message);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-IN';
    utterance.rate = settings.voiceSpeed || 1.0;
    utterance.onend = () => {
      isSpeakingRef.current = false;
      try {
        startListening();
      } catch (e) {
        // ignore
      }
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      try {
        startListening();
      } catch (e) {
        // ignore
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const { listening, startListening, stopListening, error } = useVoice({
    onCommand: (text) => {
      const transcript = text.trim().toLowerCase();
      if (isSpeakingRef.current) return;
      const lastPrompt = lastPromptRef.current.toLowerCase();
      const commandWords = ['confirm', 'cancel', 'help', 'send money'];
      const isCommandWord = commandWords.some((word) => transcript.includes(word));
      if (!isCommandWord && lastPrompt) {
        const longEnough = transcript.length > 6;
        if (longEnough && (transcript.includes(lastPrompt) || lastPrompt.includes(transcript))) {
          return;
        }
      }
      if (transcript.includes('to send money to') || transcript.includes('how much would you like to send')) {
        return;
      }
      if (transcript.includes('say help') || transcript.includes('voice mode is enabled')) {
        return;
      }

      const currentFlow = flowRef.current;

      if (transcript.includes('cancel') && currentFlow.step !== 'idle') {
        const reset = { step: 'idle', recipientUpiId: '', amount: '' };
        setFlow(reset);
        flowRef.current = reset;
        toast.info('Cancelled voice transaction');
        if (settings.enableVoiceNavigation) {
          speak('Cancelled voice transaction.');
        }
        return;
      }

      if (transcript.includes('repeat') && lastPromptRef.current) {
        say(lastPromptRef.current);
        return;
      }

      if (transcript.includes('send money')) {
        if (transcript.includes('to')) {
          const recipientUpiId = normalizeRecipient(transcript);
          if (!recipientUpiId) {
            say('Please say the recipient UPI ID.');
            const next = { step: 'awaitingRecipient', recipientUpiId: '', amount: '' };
            setFlow(next);
            flowRef.current = next;
            return;
          }
          const nextPrompt = 'How much would you like to send?';
          say(nextPrompt);
          const next = { step: 'awaitingAmount', recipientUpiId, amount: '' };
          setFlow(next);
          flowRef.current = next;
          return;
        }

        const prompt = 'Whom would you like to send money to?';
        say(prompt);
        const next = { step: 'awaitingRecipient', recipientUpiId: '', amount: '' };
        setFlow(next);
        flowRef.current = next;
        return;
      }

      if (currentFlow.step === 'awaitingRecipient') {
        const recipientUpiId = normalizeRecipient(transcript);
        const prompt = 'How much would you like to send?';
        say(prompt);
        const next = { step: 'awaitingAmount', recipientUpiId, amount: '' };
        setFlow(next);
        flowRef.current = next;
        return;
      }

      if (currentFlow.step === 'awaitingAmount') {
        const amount = parseAmount(transcript);
        if (!amount) {
          const prompt = 'Please say the amount in rupees.';
          say(prompt);
          return;
        }
        if (!currentFlow.recipientUpiId) {
          const prompt = 'Please say the recipient name or UPI ID.';
          say(prompt);
          const next = { step: 'awaitingRecipient', recipientUpiId: '', amount: '' };
          setFlow(next);
          flowRef.current = next;
          return;
        }
        const draft = {
          action: 'VOICE_SEND_DRAFT',
          recipientUpiId: currentFlow.recipientUpiId,
          amount
        };
        const reset = { step: 'idle', recipientUpiId: '', amount: '' };
        setFlow(reset);
        flowRef.current = reset;
        say('Draft created. Opening send money screen.');
        console.log('🎯 Voice Draft:', draft);
        onAction?.(draft);
        return;
      }

      const command = parseVoiceCommand(transcript);
      console.log('🧠 Command:', command);
      if (command.action === 'HELP') {
        say('You can say: send money, show balance, show transactions, settings, fraud alerts, trusted contacts, go back, or logout.');
        return;
      }

      if (command.action === 'CONFIRM_TRANSACTION') {
        if (settings.enableVoiceNavigation) {
          speak('Confirming.');
        }
        window.dispatchEvent(new CustomEvent('voice:confirm'));
        return;
      }

      if (command.action === 'CANCEL_TRANSACTION') {
        if (settings.enableVoiceNavigation) {
          speak('Cancelling.');
        }
        window.dispatchEvent(new CustomEvent('voice:cancel'));
        return;
      }

      if (command.action === 'UNKNOWN') {
        if (lastPromptRef.current.includes('recipient')) {
          const recipientUpiId = normalizeRecipient(transcript);
          const nextPrompt = 'How much would you like to send?';
          say(nextPrompt);
          const next = { step: 'awaitingAmount', recipientUpiId, amount: '' };
          setFlow(next);
          flowRef.current = next;
          return;
        }
        if (lastPromptRef.current.includes('amount')) {
          const amount = parseAmount(transcript);
          if (amount) {
            const draft = {
              action: 'VOICE_SEND_DRAFT',
              recipientUpiId: currentFlow.recipientUpiId,
              amount
            };
            const reset = { step: 'idle', recipientUpiId: '', amount: '' };
            setFlow(reset);
            flowRef.current = reset;
            onAction?.(draft);
            return;
          }
        }
        toast.info('Sorry, I did not understand that.');
        return;
      }

      onAction?.(command);
    }
  });

  useEffect(() => {
    if (!settings.enableVoiceNavigation) return;
    if (autoStartedRef.current || listening) return;
    try {
      startListening();
      autoStartedRef.current = true;
      say('Voice mode is enabled. Say help to hear commands.');
    } catch (e) {
      // Browser may block without user gesture.
    }
  }, [listening, settings.enableVoiceNavigation, startListening, speak]);

  useEffect(() => {
    if (!settings.enableVoiceNavigation || listening) return;
    setNeedsGesture(true);
    const enableOnGesture = () => {
      try {
        startListening();
        setNeedsGesture(false);
        say('Voice mode is enabled. Say help to hear commands.');
      } catch (e) {
        // ignore
      }
      window.removeEventListener('click', enableOnGesture);
      window.removeEventListener('keydown', enableOnGesture);
    };
    window.addEventListener('click', enableOnGesture);
    window.addEventListener('keydown', enableOnGesture);
    return () => {
      window.removeEventListener('click', enableOnGesture);
      window.removeEventListener('keydown', enableOnGesture);
    };
  }, [listening, settings.enableVoiceNavigation, startListening]);

  useEffect(() => {
    if (!error) return;
    const normalized = String(error).toLowerCase();
    const blocked = ['not-allowed', 'service-not-allowed', 'audio-capture', 'notallowederror'];
    if (blocked.some((code) => normalized.includes(code))) {
      setNeedsGesture(true);
      toast.info('Tap to enable microphone for voice commands.');
    }
  }, [error]);

  const handleEnableVoice = () => {
    try {
      startListening();
      setNeedsGesture(false);
      say('Voice mode is enabled. Say help to hear commands.');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div>
      <p className="subtle">Voice: {listening ? 'Listening' : 'Idle'}</p>
      {error && (
        <p style={{ color: 'red' }}>
          Voice error: {String(error)}. Please allow microphone access in the browser.
        </p>
      )}
      {lastPrompt && (
        <p className="subtle" style={{ marginTop: '8px' }}>{lastPrompt}</p>
      )}
      {needsGesture && (
        <div className="card" style={{ marginTop: '12px', background: '#fff7ed' }}>
          <p className="subtle">
            Tap anywhere to enable microphone access for voice commands.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
