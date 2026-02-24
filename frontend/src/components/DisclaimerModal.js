import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DisclaimerModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const dismissed = localStorage.getItem('disclaimerDismissed');
    if (dismissed) {
      onClose();
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
        localStorage.setItem('disclaimerDismissed', 'true');
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    localStorage.setItem('disclaimerDismissed', 'true');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-2xl max-w-md w-full p-6 fade-in" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-saffron" />
            <h3 id="disclaimer-title" className="text-xl font-bold text-text-primary">Important Note</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-saffron transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-text-secondary">
          <p>
            <strong>This app gives ideas but is not a lawyer.</strong>
          </p>
          
          <ul className="list-disc list-inside space-y-2">
            <li>This is only for learning and understanding.</li>
            <li>Laws in India can be different based on where you are.</li>
            <li>Talk to a lawyer for your specific problem.</li>
            <li>Some legal steps have time limits, so act fast.</li>
          </ul>

          <p className="text-xs text-text-secondary border-t pt-3">
            By using this app, you agree to talk to a lawyer for real advice.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleClose}
            className="btn-primary w-full"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;