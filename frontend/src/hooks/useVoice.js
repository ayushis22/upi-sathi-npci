// src/hooks/useVoice.js
import { useEffect, useRef, useState } from 'react';

export const useVoice = ({ onCommand }) => {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const shouldListenRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('🎤 Heard:', transcript);
      onCommand?.(transcript);
    };

    recognition.onerror = (e) => {
      console.error('Voice error:', e);
      if (e.error === 'aborted' || e.error === 'no-speech') {
        if (shouldListenRef.current) {
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          restartTimeoutRef.current = setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setListening(true);
            } catch (err) {
              // ignore
            }
          }, 250);
        }
        return;
      }
      setError(e.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      if (shouldListenRef.current) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setListening(true);
          } catch (err) {
            // ignore
          }
        }, 250);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      recognition.stop();
    };
  }, [onCommand]);

  const startListening = () => {
    shouldListenRef.current = true;
    if (!recognitionRef.current) {
      setError('not-supported');
      return;
    }
    if (listening) return;
    try {
      recognitionRef.current.start();
      setListening(true);
      setError(null);
    } catch (err) {
      const name = err?.name || err?.message || 'not-allowed';
      setError(name);
      setListening(false);
      shouldListenRef.current = false;
    }
  };

  const stopListening = (options = {}) => {
    if (!options.temporary) {
      shouldListenRef.current = false;
    }
    recognitionRef.current?.stop();
    setListening(false);
  };

  return {
    listening,
    startListening,
    stopListening,
    error
  };
};
