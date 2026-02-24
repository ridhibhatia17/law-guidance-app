import React, { useState } from 'react';
import CaseDetailsModal from './CaseDetailsModal';
import { CheckCircle, Clock, DollarSign, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { getCaseDetails } from '../utils/api';

const GuidanceOutput = ({ analysisResult, caseTypeResult, activeTab }) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const handleMoreDetails = async (caseType) => {
    setSelectedCase(caseType);
    setLoadingDetails(true);
    setDetailsError('');
    try {
      const details = await getCaseDetails(caseTypeResult.problemType, caseType.type);
      setCaseDetails(details);
    } catch (err) {
      setDetailsError(err.message || 'We couldn’t get case details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!analysisResult && !caseTypeResult) {
    return null;
  }

  const renderBreachAnalysis = () => (
    <div className="space-y-6">
      <div className="card fade-in">
        <div className="flex items-center space-x-3 mb-4">
          {analysisResult.isBreach ? (
            <CheckCircle className="h-6 w-6 text-error-red" />
          ) : (
            <AlertCircle className="h-6 w-6 text-saffron" />
          )}
          <h3 className="text-xl font-bold text-text-primary">
            {analysisResult.isBreach ? 'It’s Likely a Contract Problem' : 'Not Sure If It’s a Contract Problem'}
          </h3>
        </div>
        
        <p className="text-text-secondary text-sm leading-relaxed">{analysisResult.explanation}</p>
        
        <div className="bg-card-bg rounded-lg p-4 mt-4 border border-gray-200">
          <p className="text-xs font-medium text-text-secondary mb-2">
            How Sure We Are: {Math.round(analysisResult.confidence * 100)}%
          </p>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-saffron h-3 rounded-full transition-all duration-500" 
              style={{ width: `${analysisResult.confidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {analysisResult.remedies && analysisResult.remedies.length > 0 && (
        <div className="card fade-in">
          <h4 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green" />
            Ways to Fix It
          </h4>
          <ul className="space-y-2">
            {analysisResult.remedies.map((remedy, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-text-secondary">{remedy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysisResult.nextSteps && analysisResult.nextSteps.length > 0 && (
        <div className="card fade-in">
          <h4 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-saffron" />
            What to Do Next
          </h4>
          <ol className="space-y-3">
            {analysisResult.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-saffron text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm text-text-secondary">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );

  const renderCaseTypes = () => (
    <div className="space-y-6">
      <div className="card fade-in">
        <h3 className="text-xl font-bold text-text-primary mb-4">Possible Case Types</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">{caseTypeResult.generalAdvice}</p>
        
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-5 w-5 text-green" />
          <span className="text-sm text-text-secondary">
            Chance of Winning: {Math.round(caseTypeResult.estimatedSuccess * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-4">
          <div 
            className="bg-green h-3 rounded-full transition-all duration-500" 
            style={{ width: `${caseTypeResult.estimatedSuccess * 100}%` }}
          ></div>
        </div>
      </div>

      {caseTypeResult.recommendedCases.map((caseType, index) => (
        <div key={index} className="card fade-in border-l-4 border-saffron">
          <h4 className="text-lg font-semibold text-text-primary mb-2">{caseType.type}</h4>
          <p className="text-text-secondary text-sm mb-3">{caseType.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <span className="font-medium text-text-secondary">Chance:</span>
              <p className={`mt-1 font-medium ${
                caseType.likelihood === 'High' ? 'text-green' :
                caseType.likelihood === 'Medium' ? 'text-saffron' : 'text-error-red'
              }`}>
                {caseType.likelihood}
              </p>
            </div>
            <div>
              <span className="font-medium text-text-secondary">Time:</span>
              <p className="text-text-secondary mt-1">{caseType.timeframe}</p>
            </div>
            <div>
              <span className="font-medium text-text-secondary">Cost:</span>
              <p className="text-text-secondary mt-1">{caseType.cost}</p>
            </div>
          </div>

          <button
            onClick={() => handleMoreDetails(caseType)}
            className="btn-secondary w-full flex items-center justify-center space-x-2 text-sm"
          >
            <ChevronRight className="h-4 w-4" />
            <span>More Details</span>
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6" role="region" aria-live="polite">
      {activeTab === 'breach-analysis' && analysisResult && renderBreachAnalysis()}
      {activeTab === 'case-finder' && caseTypeResult && renderCaseTypes()}

      <CaseDetailsModal 
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        caseType={selectedCase}
        loading={loadingDetails}
        error={detailsError}
        details={caseDetails}
      />
    </div>
  );
};

export default GuidanceOutput;