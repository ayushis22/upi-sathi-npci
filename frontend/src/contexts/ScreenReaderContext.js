import React, { createContext, useContext, useState } from 'react';

const ScreenReaderContext = createContext();

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within ScreenReaderProvider');
  }
  return context;
};

export const ScreenReaderProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(false);

  const speak = (text) => {
    if (!enabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggle = () => setEnabled(prev => !prev);

  return (
    <ScreenReaderContext.Provider value={{ enabled, toggle, speak }}>
      {children}
    </ScreenReaderContext.Provider>
  );
};
