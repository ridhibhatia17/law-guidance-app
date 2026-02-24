import React, { useState, useEffect } from 'react';
import { analyzeContractBreach } from '../utils/api';
import { AlertTriangle, Send } from 'lucide-react';

const ContractBreachForm = ({ onResult, onShowDisclaimer }) => {
  const [situation, setSituation] = useState('');
  const [contractType, setContractType] = useState('general');
  const [otherContractType, setOtherContractType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const contractTypes = [
    { value: 'general', label: 'General Contract' },
    { value: 'employment', label: 'Job Contract' },
    { value: 'rental', label: 'Rent or Lease' },
    { value: 'business', label: 'Business Agreement' },
    { value: 'service', label: 'Service Contract' },
    { value: 'sales', label: 'Sales Agreement' },
    { value: 'other', label: 'Other (Please Explain)' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('breachForm');
    if (saved) {
      const { situation: savedSit, contractType: savedType, otherContractType: savedOther } = JSON.parse(saved);
      setSituation(savedSit);
      setContractType(savedType);
      setOtherContractType(savedOther || '');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('breachForm', JSON.stringify({ situation, contractType, otherContractType }));
  }, [situation, contractType, otherContractType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!situation.trim()) {
      setError('Please tell us what happened.');
      return;
    }

    if (situation.length > 2000) {
      setError('Your description is too long (max 2000 letters).');
      return;
    }

    if (contractType === 'other' && !otherContractType.trim()) {
      setError('Please explain the contract type for "Other".');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeContractBreach(situation, contractType === 'other' ? otherContractType : contractType);
      onResult(result);
      onShowDisclaimer();
      localStorage.removeItem('breachForm');
    } catch (err) {
      setError(err.message || 'We couldn’t check your situation. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-saffron" />
        <h2 id="breach-title" className="text-2xl font-bold text-text-primary">
          Check Contract Issues
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="contractType" className="block text-sm font-medium text-text-primary mb-1.5">
            What kind of contract?
          </label>
          <select
            id="contractType"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="input-field"
            aria-required="true"
          >
            {contractTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {contractType === 'other' && (
          <div>
            <label htmlFor="otherContractType" className="block text-sm font-medium text-text-primary mb-1.5">
              Tell us about the contract
            </label>
            <input
              id="otherContractType"
              value={otherContractType}
              onChange={(e) => setOtherContractType(e.target.value)}
              placeholder="E.g., Freelance work agreement"
              className="input-field"
              aria-required="true"
            />
          </div>
        )}

        <div>
          <label htmlFor="situation" className="block text-sm font-medium text-text-primary mb-1.5">
            What happened?
          </label>
          <textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="E.g., My client didn’t pay me for freelance work after I finished it..."
            className="textarea-field"
            rows={5}
            aria-describedby="situation-tip"
          />
          <p id="situation-tip" className="mt-1.5 text-xs text-text-secondary">
            Add details like dates, money involved, and any agreements. We save this for you.
          </p>
        </div>

        {error && (
          <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-3" role="alert">
            <p className="text-sm text-error-red">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
          aria-disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Checking...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Check My Issue
            </>
          )}
        </button>
      </form>

      <div className="mt-5 p-4 bg-saffron/10 rounded-lg">
        <p className="text-sm text-text-primary">
          <strong>Tip:</strong> Add as many details as you can for a better answer.
        </p>
      </div>
    </div>
  );
};

export default ContractBreachForm;