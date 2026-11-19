import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReportModal({ isOpen, onClose, propertyId }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const { addToast, submitReport, user, openAuthDialog } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    'Property unavailable',
    'Incorrect price',
    'Incorrect property type',
    'Wrong location',
    'Misleading photos',
    'Property does not exist',
    'Suspicious lister',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      addToast('Please select a reason for reporting.', 'error');
      return;
    }
    
    if (!user) {
      addToast('Sign in before submitting a report.', 'error');
      openAuthDialog();
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport({ propertyId, reason, details });
      addToast('Report submitted successfully. Our team will review this listing.');
      setReason('');
      setDetails('');
      onClose();
    } catch (error) {
      addToast(`Could not submit report: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-text-muted hover:text-text focus:outline-none transition-colors"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-failed-light rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="w-6 h-6 text-failed" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-text" id="modal-title">
                Report this listing
              </h3>
              <div className="mt-2">
                <p className="text-sm text-text-secondary mb-4">
                  Help us keep Niwas safe and accurate. Why are you reporting this property?
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {reasons.map((r) => (
                      <div key={r} className="flex items-center">
                        <input
                          id={`reason-${r}`}
                          name="reason"
                          type="radio"
                          className="w-4 h-4 text-primary border-border focus:ring-primary"
                          checked={reason === r}
                          onChange={() => setReason(r)}
                        />
                        <label htmlFor={`reason-${r}`} className="ml-3 block text-sm font-medium text-text cursor-pointer">
                          {r}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <label htmlFor="details" className="block text-sm font-medium text-text mb-1">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      id="details"
                      rows={3}
                      className="block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface"
                      placeholder="Please provide more context to help us investigate..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                    />
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-failed border border-transparent rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-failed sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isSubmitting ? 'Submitting…' : 'Submit Report'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex justify-center w-full px-4 py-2 text-base font-medium text-text bg-white border border-border rounded-md shadow-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
