// utils/notifySuccess.js
import { toast } from "react-toastify";

export const notifySuccess = ({ message, speakEnabled, speak }) => {
  // visual feedback
  toast.success(message);

  // voice feedback
  if (speakEnabled && typeof speak === "function") {
    speak(message);
  }
};

export const notifyError = ({ message, speakEnabled, speak }) => {
  toast.error(message);

  if (speakEnabled && typeof speak === "function") {
    speak(message);
  }
};
