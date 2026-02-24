import React, { useState, useEffect } from 'react';
import { findCaseType } from '../utils/api';
import { Gavel, ChevronDown } from 'lucide-react';

const CaseTypeFinder = ({ onResult, onShowDisclaimer }) => {
  const [problemType, setProblemType] = useState('');
  const [otherProblemType, setOtherProblemType] = useState('');
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const problemTypes = [
    { value: '', label: 'Choose your problem...' },
    { value: 'employment', label: 'Job Issues (pay, firing, workplace)' },
    { value: 'rental', label: 'Rent Issues (deposit, repairs, eviction)' },
    { value: 'business', label: 'Business Deals (suppliers, services)' },
    { value: 'loan', label: 'Loan or Credit Issues (payments, terms)' },
    { value: 'consumer', label: 'Shopping Issues (products, warranties)' },
    { value: 'insurance', label: 'Insurance Issues (claims, denials)' },
    { value: 'other', label: 'Other (Please Explain)' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('caseTypeForm');
    if (saved) {
      const { problemType: savedType, situation: savedSit, otherProblemType: savedOther } = JSON.parse(saved);
      setProblemType(savedType);
      setSituation(savedSit);
      setOtherProblemType(savedOther || '');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('caseTypeForm', JSON.stringify({ problemType, situation, otherProblemType }));
  }, [problemType, situation, otherProblemType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!problemType) {
      setError('Please choose a problem type.');
      return;
    }

    if (problemType === 'other' && !otherProblemType.trim()) {
      setError('Please explain the problem type for "Other".');
      return;
    }

    if (situation.length > 2000) {
      setError('Your description is too long (max 2000 letters).');
      return;
    }

    setLoading(true);
    try {
      const result = await findCaseType(
        problemType === 'other' ? otherProblemType : problemType,
        situation
      );
      onResult(result);
      onShowDisclaimer();
      localStorage.removeItem('caseTypeForm');
    } catch (err) {
      setError(err.message || 'We couldn’t find case types. Please try again.');
      console.error('Case type error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <Gavel className="h-6 w-6 text-saffron" />
        <h2 id="case-finder-title" className="text-2xl font-bold text-text-primary">
          Find Case Type
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="problemType" className="block text-sm font-medium text-text-primary mb-1.5">
            What’s your problem?
          </label>
          <div className="relative">
            <select
              id="problemType"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="input-field appearance-none pr-10"
              aria-required="true"
            >
              {problemTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-text-secondary pointer-events-none" />
          </div>
        </div>

        {problemType === 'other' && (
          <div>
            <label htmlFor="otherProblemType" className="block text-sm font-medium text-text-primary mb-1.5">
              Tell us about the problem
            </label>
            <input
              id="otherProblemType"
              value={otherProblemType}
              onChange={(e) => setOtherProblemType(e.target.value)}
              placeholder="E.g., Someone copied my design"
              className="input-field"
              aria-required="true"
            />
          </div>
        )}

        <div>
          <label htmlFor="situation" className="block text-sm font-medium text-text-primary mb-1.5">
            Any extra details? (Optional)
          </label>
          <textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="E.g., Someone used my design without asking..."
            className="textarea-field"
            rows={4}
            aria-describedby="situation-help"
          />
          <p id="situation-help" className="mt-1.5 text-xs text-text-secondary">
            We save this for you.
          </p>
        </div>

        {error && (
          <div className="bg-error-red/10 border border-error-red/20 rounded-lg p-3" role="alert">
            <p className="text-sm text-error-red">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !problemType}
          className="btn-primary w-full"
          aria-disabled={loading || !problemType}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Finding Case Types...
            </>
          ) : (
            <>
              <Gavel className="h-4 w-4 mr-2" />
              Find My Case
            </>
          )}
        </button>
      </form>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-green/10 rounded-lg">
          <h4 className="font-semibold text-green mb-1">Quick Fixes</h4>
          <p className="text-xs text-text-secondary">Small claims, mediation, complaints</p>
        </div>
        <div className="p-4 bg-saffron/10 rounded-lg">
          <h4 className="font-semibold text-saffron mb-1">Court Cases</h4>
          <p className="text-xs text-text-secondary">Civil court, arbitration</p>
        </div>
      </div>
    </div>
  );
};

export default CaseTypeFinder;