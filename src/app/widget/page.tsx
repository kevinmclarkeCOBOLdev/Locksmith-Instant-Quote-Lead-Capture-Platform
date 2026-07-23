'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

const SERVICES = [
  { id: 'Locked Out', label: 'Locked Out', icon: '🔓', desc: 'Fast emergency entry service' },
  { id: 'Lost Keys', label: 'Lost Keys', icon: '🔑', desc: 'Key replacement & lock rekey' },
  { id: 'Broken Key', label: 'Broken Key', icon: '✂️', desc: 'Key extraction & lock repair' },
  { id: 'Lock Replacement', label: 'Lock Replacement', icon: '🔒', desc: 'Upgrade or change locks' },
  { id: 'Lock Repair', label: 'Lock Repair', icon: '🛠️', desc: 'Fix sticking or faulty locks' },
  { id: 'UPVC Door Lock', label: 'UPVC Door Lock', icon: '🚪', desc: 'Mechanism repair or change' },
  { id: 'Security Upgrade', label: 'Security Upgrade', icon: '🛡️', desc: 'High security lock fits' },
  { id: 'Commercial Locksmith', label: 'Commercial Locksmith', icon: '🏢', desc: 'Shops, offices & warehouses' },
];

const PROPERTY_TYPES = [
  { id: 'House', label: 'House', icon: '🏡' },
  { id: 'Flat', label: 'Flat', icon: '🏢' },
  { id: 'Office', label: 'Office', icon: '💼' },
  { id: 'Retail', label: 'Retail', icon: '🛒' },
  { id: 'Commercial Unit', label: 'Commercial Unit', icon: '🏭' },
];

const URGENCY_LEVELS = [
  { id: 'Emergency', label: 'Emergency (within 1 hour)', icon: '🚨', desc: 'Immediate priority dispatch' },
  { id: 'Same Day', label: 'Same Day Appointment', icon: '📅', desc: 'Scheduled entry or repair' },
  { id: 'Flexible', label: 'Flexible / General Enquiry', icon: '🗓️', desc: 'Plan for the coming days' },
];

function WizardContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenant') || DEFAULT_TENANT_ID;

  // Wizard state
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [urgency, setUrgency] = useState('');
  const [postcode, setPostcode] = useState('');
  const [message, setMessage] = useState('');

  // Lead capture state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);

  // Statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quoteEstimate, setQuoteEstimate] = useState<{ minPrice: number; maxPrice: number } | null>(null);

  // Send message to parent window to resize iframe height if embedded
  useEffect(() => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: 'resize-widget', height }, '*');
  }, [step, error, quoteEstimate]);

  const handleNext = () => {
    if (step === 1 && !serviceType) return setError('Please select what you need help with');
    if (step === 2 && !propertyType) return setError('Please select your property type');
    if (step === 3 && !urgency) return setError('Please select your urgency level');
    if (step === 4) {
      if (!postcode.trim()) return setError('Please enter your postcode');
      const cleanPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase();
      // Basic UK postcode regex validation
      const ukPostcodeRegex = /^[A-Z]{1,2}[0-9.][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
      const genericRegex = /^[0-9A-Z]{2,8}$/i;
      if (!ukPostcodeRegex.test(cleanPostcode) && !genericRegex.test(cleanPostcode)) {
        return setError('Please enter a valid postcode');
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name');
    if (!phone.trim()) return setError('Please enter your phone number');
    if (!email.trim()) return setError('Please enter your email address');
    if (!consent) return setError('You must consent to being contacted to proceed');

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          name,
          phone,
          email,
          postcode,
          serviceType,
          propertyType,
          urgency,
          message,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Server error occurred while calculating estimate. Please try again.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request');
      }

      // Quote ranges received
      setQuoteEstimate({
        minPrice: parseInt(data.quote.minPrice),
        maxPrice: parseInt(data.quote.maxPrice),
      });
      setStep(6);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.round(((step - 1) / 5) * 100);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800/80 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-slate-850">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Instant Quote Wizard
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Step {step} of 6
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2 animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Step 1: Services */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">What do you need help with?</h2>
              <div className="grid grid-cols-2 gap-3">
                {SERVICES.map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setServiceType(service.id);
                      setError('');
                      setStep(2);
                    }}
                    type="button"
                    className={`p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between ${
                      serviceType === service.id
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/5 text-white'
                        : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-750'
                    }`}
                  >
                    <span className="text-2xl mb-2">{service.icon}</span>
                    <div>
                      <span className="font-semibold text-sm block">{service.label}</span>
                      <span className="text-xs text-slate-400 font-normal mt-0.5 block line-clamp-1">{service.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Property Type */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">Select property type</h2>
              <div className="space-y-3">
                {PROPERTY_TYPES.map(prop => (
                  <button
                    key={prop.id}
                    onClick={() => {
                      setPropertyType(prop.id);
                      setError('');
                      setStep(3);
                    }}
                    type="button"
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                      propertyType === prop.id
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-750'
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-3">
                      <span className="text-xl">{prop.icon}</span> {prop.label}
                    </span>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      propertyType === prop.id ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
                    }`}>
                      {propertyType === prop.id && <span className="w-2.5 h-2.5 bg-slate-900 rounded-full" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Urgency */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">How urgent is this?</h2>
              <div className="space-y-3">
                {URGENCY_LEVELS.map(urg => (
                  <button
                    key={urg.id}
                    onClick={() => {
                      setUrgency(urg.id);
                      setError('');
                      setStep(4);
                    }}
                    type="button"
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1 ${
                      urgency === urg.id
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-slate-800 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-750'
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-3 text-sm">
                      <span className="text-xl">{urg.icon}</span> {urg.label}
                    </span>
                    <span className="text-xs text-slate-400 pl-8">{urg.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Postcode */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">Where do you need us?</h2>
              <p className="text-sm text-slate-400 mb-2">We geocode postcodes to calculate travel distance and ensure coverage.</p>
              <div>
                <label htmlFor="postcode" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Postcode
                </label>
                <input
                  id="postcode"
                  type="text"
                  placeholder="e.g. SW1A 1AA"
                  value={postcode}
                  onChange={e => {
                    setPostcode(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                />
              </div>
            </div>
          )}

          {/* Step 5: Optional Details */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">Any additional details? (Optional)</h2>
              <p className="text-sm text-slate-400 mb-2">Let the locksmith know details about the fault, keys, lock models, or times.</p>
              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Message / Details
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="e.g. Lock barrel is spinning, or I need the cylinder lock replaced on my front UPVC door..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 5.5: Lead capture before displaying estimate */}
          {step === 5 && (
            <form onSubmit={handleSubmitLead} className="mt-6 space-y-4 border-t border-slate-700/50 pt-6">
              <h3 className="text-md font-bold text-white mb-1">Enter your details to generate your Instant Quote</h3>
              
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="07700 900077"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-3">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="mt-1 accent-amber-500 rounded border-slate-700 bg-slate-800 text-amber-500"
                />
                <label htmlFor="consent" className="text-xs text-slate-400 leading-tight">
                  I consent to receive an email/SMS estimate and agree to the locksmith contacting me to book this service.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-slate-900 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-4 hover:shadow-amber-500/10"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating Estimate...
                  </>
                ) : (
                  'Generate Instant Quote'
                )}
              </button>
            </form>
          )}

          {/* Step 6: Success Page & Display Estimate */}
          {step === 6 && quoteEstimate && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Instant Estimate</h2>
                <p className="text-sm text-slate-400 mt-1">We have logged your request and sent confirmation details.</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-700/30 rounded-2xl p-6 inline-block w-full">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Estimated Pricing Range
                </span>
                <div className="text-4xl font-extrabold text-amber-400">
                  £{quoteEstimate.minPrice} - £{quoteEstimate.maxPrice}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  *Excludes parts or lock replacements if required
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-6 space-y-3 text-left max-w-sm mx-auto text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-semibold text-white">{serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Urgency:</span>
                  <span className="font-semibold text-white">{urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Postcode:</span>
                  <span className="font-semibold text-white uppercase">{postcode}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                A local locksmith technician will call you shortly on <span className="font-semibold text-slate-300">{phone}</span> to confirm booking details.
              </p>

              <button
                onClick={() => {
                  setStep(1);
                  setServiceType('');
                  setPropertyType('');
                  setUrgency('');
                  setPostcode('');
                  setMessage('');
                  setName('');
                  setPhone('');
                  setEmail('');
                  setConsent(false);
                  setQuoteEstimate(null);
                }}
                className="w-full bg-slate-750 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-slate-700 text-sm"
              >
                Submit Another Enquiry
              </button>
            </div>
          )}
        </div>

        {/* Footer controls for Step 2, 3, 4 */}
        {step > 1 && step < 6 && (
          <div className="p-4 border-t border-slate-700/50 bg-slate-850 flex justify-between gap-4">
            <button
              onClick={handleBack}
              type="button"
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-750 transition-colors font-semibold text-sm"
            >
              Back
            </button>
            {/* Show Next button only for steps without submission (1, 2, 3 selection buttons go automatically, step 4 postcode goes to next, step 5 has form submit) */}
            {step === 4 && (
              <button
                onClick={handleNext}
                type="button"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-md"
              >
                Continue
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="text-slate-400 animate-pulse">Loading Wizard...</div>
      </div>
    }>
      <WizardContent />
    </Suspense>
  );
}
