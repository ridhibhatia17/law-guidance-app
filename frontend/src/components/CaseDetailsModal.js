import React from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';

const CaseDetailsModal = ({ isOpen, onClose, caseType, loading, error, details }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 fade-in" role="dialog" aria-modal="true" aria-labelledby="case-details-title">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-card-bg z-10 pb-4 border-b border-gray-600">
          <h3 id="case-details-title" className="text-xl font-bold text-text-primary">Details for {caseType?.type}</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-saffron transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-8 w-8 text-saffron animate-spin" />
            <p className="mt-4 text-text-secondary">Getting details...</p>
          </div>
        ) : error ? (
          <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-error-red" />
            <p className="text-sm text-error-red">{error}</p>
          </div>
        ) : details ? (
          <div className="space-y-6 text-sm text-text-secondary">
            <section>
              <h4 className="text-lg font-semibold text-text-primary mb-2">What is this case?</h4>
              <p>{details.overview}</p>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Good Things</h4>
              <ul className="list-disc list-inside space-y-1">
                {details.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Challenges</h4>
              <ul className="list-disc list-inside space-y-1">
                {details.drawbacks.map((drawback, index) => (
                  <li key={index}>{drawback}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Steps to Fight This Case</h4>
              <ol className="list-decimal list-inside space-y-2">
                {details.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>
          </div>
        ) : (
          <p className="text-text-secondary">No details available.</p>
        )}
      </div>
    </div>
  );
};

export default CaseDetailsModal;