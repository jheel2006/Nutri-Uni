// src/components/ToastContext.jsx
import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white z-50
            ${toast.type === "error" ? "bg-red-500" : toast.type === "success" ? "bg-green-500" : "bg-gray-700"}
        `}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
