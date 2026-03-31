import { useState, useEffect } from 'react';
import { Mail, Send, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';
import { validateEmail as utilValidateEmail } from '../../utils/validation';

/**
 * Common standalone Email Address Validation component with OTP flow.
 * Supports: 
 * - Email address input with validation
 * - Mandatory verification via simulated OTP
 * - Clear visual verified state
 * - Reports 'verified' status to parent
 */
const labelStyles = "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1";
const getFieldStyles = (hasError) => {
  return `block w-full rounded-lg border bg-white py-2 px-3 text-slate-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 text-sm ${hasError
    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20'
    : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10'
    }`;
};

export default function EmailAddressValidation({ 
  value, 
  onChange, 
  onVerifiedStatusChange, 
  isVerified: externalVerified,
  disabled = false,
  className = ""
}) {
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [internalEmailVerified, setInternalEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const toast = useToast();

  const isEmailVerified = externalVerified !== undefined ? externalVerified : internalEmailVerified;

  // Sync internal state if external status is used
  useEffect(() => {
    if (externalVerified !== undefined) {
      setInternalEmailVerified(externalVerified);
    }
  }, [externalVerified]);

  const handleSendVerification = () => {
    const error = utilValidateEmail(value);
    if (error) {
      setEmailError(error);
      toast.error('Please enter a valid email address first.');
      return;
    }
    setIsVerifyingEmail(true);
    toast.success('Verification code has been sent. Check your email.', { duration: 4000 });
  };

  const handleVerifyCode = () => {
    if (verificationCode === '123456') { // Mock logic for 123456
      setIsVerifyingEmail(false);
      setInternalEmailVerified(true);
      onVerifiedStatusChange?.(true);
      toast.success('Email verified successfully.');
    } else {
      toast.error('Invalid verification code. Use 123456 for testing.');
    }
  };

  return (
    <div className={`grid gap-4 transition-all duration-500 ${isVerifyingEmail ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} ${className}`}>
      {/* Email Input Field */}
      <div className="relative space-y-1.5 flex-1">
        <label htmlFor="email_validator" className={labelStyles}>
          <Mail className="h-3.5 w-3.5 text-teal-600/60" />
          Email Address<span className="text-rose-500 ml-1">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            id="email_validator"
            name="email"
            type="email"
            disabled={isEmailVerified || isVerifyingEmail || disabled}
            value={value}
            onChange={(e) => {
              onChange?.(e.target.value);
              if (emailError) setEmailError('');
            }}
            onBlur={(e) => {
              if (e.target.value) {
                const err = utilValidateEmail(e.target.value);
                setEmailError(err || '');
              }
            }}
            required
            className={`${getFieldStyles(!!emailError)} ${isEmailVerified || isVerifyingEmail ? 'opacity-75 bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
            placeholder="john@example.com"
            autoComplete="off"
          />
          
          {!isEmailVerified && !isVerifyingEmail && !disabled && (
            <button
              type="button"
              onClick={handleSendVerification}
              className="absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-md transition-all shadow-sm"
              title="Verify Email"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
          
          {isEmailVerified && (
            <div className="absolute right-3 flex items-center gap-1.5 text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 font-bold text-[9px] uppercase tracking-wider pointer-events-none animate-in zoom-in duration-300">
              Verified
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
        
        {emailError && (
          <p className="error-msg flex items-center gap-1 text-[10px] text-rose-500 mt-1 font-medium animate-in fade-in slide-in-from-top-0.5 duration-200">
            <AlertCircle className="h-3 w-3" />
            {emailError}
          </p>
        )}
      </div>

      {/* Verification Code Input (Conditional) */}
      {isVerifyingEmail && !isEmailVerified && (
        <div className="relative space-y-1.5 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
          <label htmlFor="verification_code" className={labelStyles}>
            <KeyRound className="h-3.5 w-3.5 text-teal-600/60" />
            Code (Use 123456)
          </label>
          <div className="relative flex items-center">
            <input
              id="verification_code"
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className={getFieldStyles(false)}
              placeholder="000000"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              className="absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-md transition-all font-bold text-[9px] uppercase tracking-widest"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
