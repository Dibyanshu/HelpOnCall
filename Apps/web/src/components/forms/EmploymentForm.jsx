import { useState, useRef } from 'react';
import { Upload, CheckCircle2, X, Briefcase, User, Phone } from 'lucide-react';
import { useToast } from '../common/Toast';
import { submitEmploymentApplication } from '../../appServices/employmentSubmission';
import { validatePhone as utilValidatePhone } from '../../utils/validation';
import EmailAddressValidation from '../common/EmailAddressValidation';
import ServiceCategorySelect from '../common/ServiceCategorySelect';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function isServiceSelection(item) {
  return (
    item &&
    typeof item === 'object' &&
    Number.isInteger(item.categoryId) &&
    Number.isInteger(item.serviceId)
  );
}

function normalizeServiceSelections(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(isServiceSelection).map((item) => ({
    categoryId: item.categoryId,
    serviceId: item.serviceId,
  }));
}

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  specializations: [],
  coverLetter: '',
  resume: null,
};

export default function EmploymentForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, resume: file }));
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!isEmailVerified) {
      setSubmitError('Please verify your email address before submitting.');
      return;
    }

    if (!formData.fullName.trim()) {
      setSubmitError('Full Name is required.');
      return;
    }

    if (!formData.phone.trim()) {
      setSubmitError('Phone Number is required.');
      return;
    }

    if (!validatePhone(formData.phone.trim())) {
      setSubmitError('Please enter a valid phone number.');
      return;
    }

    if (!formData.coverLetter.trim()) {
      setSubmitError('Cover Letter is required.');
      return;
    }

    const normalizedSpecializations = normalizeServiceSelections(formData.specializations);

    if (normalizedSpecializations.length === 0) {
      setSubmitError('Please select at least one specialization before submitting.');
      return;
    }

    if (!formData.resume) {
      setSubmitError('Please upload your resume before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitEmploymentApplication({
        apiBaseUrl: API_BASE_URL,
        formData: {
          ...formData,
          specializations: normalizedSpecializations,
        },
      });

      setIsSubmitted(true);
      setFormData(initialFormData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit your application right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePhone = (phone) => {
    const error = utilValidatePhone(phone);
    setPhoneError(error);
    return !error;
  };

  const fieldStyles = "block w-full rounded-md border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-700 transition-all duration-200";
  const emailLikeFieldStyles = "block w-full rounded-md border bg-white py-2 px-3 text-slate-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 text-sm border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10";

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in slide-in-from-bottom-8 duration-700 ease-out flex flex-col items-center bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-md bg-teal-100 opacity-75" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Sent!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your profile has entered our orbit. Our recruitment team will review your application and reach out shortly.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData(initialFormData);
            }}
            className="btn-primary w-full"
          >
            Back to Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto w-full h-full space-y-6 rounded-md bg-white p-8 shadow-2xl shadow-slate-200 ring-1 ring-slate-200 transition-all duration-500 lg:p-10 ${isSubmitting ? 'scale-95 opacity-50 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      aria-label="Employment application form"
    >
      <div className="space-y-1.5 mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Career Application</h3>
      </div>

      <EmailAddressValidation
        value={formData.email}
        onChange={(val) => {
                setFormData(prev => ({ ...prev, email: val }));
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
        onVerifiedStatusChange={setIsEmailVerified}
        isVerified={isEmailVerified}
        verificationModule="employee"
      />

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <User className="h-3.5 w-3.5 text-teal-700/70" />
            Full Name<span className="text-rose-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            disabled={!isEmailVerified}
            value={formData.fullName}
            onChange={handleChange}
            required
            className={`${emailLikeFieldStyles} ${!isEmailVerified ? 'opacity-75 bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Phone className="h-3.5 w-3.5 text-teal-700/70" />
            Phone Number<span className="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            disabled={!isEmailVerified}
            value={formData.phone}
            onChange={(e) => {
              handleChange(e);
              if (phoneError) setPhoneError('');
            }}
            onBlur={(e) => {
              if (e.target.value) validatePhone(e.target.value);
            }}
            className={`${emailLikeFieldStyles} ${!isEmailVerified ? 'opacity-75 bg-slate-50 cursor-not-allowed text-slate-500' : ''} ${phoneError ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20' : ''}`}
            placeholder="+1 (555) 000-0000"
          />
          {phoneError && (
            <p className="mt-1.5 text-[11px] font-semibold text-rose-500 animate-in fade-in slide-in-from-top-1">
              {phoneError}
            </p>
          )}
        </div>
      </div>
      <ServiceCategorySelect
        label="Specializations"
        icon={Briefcase}
        placeholder="Select Specializations"
        value={formData.specializations}
        required
        disabled={!isEmailVerified}
        onChange={(next) => {
          setFormData((prev) => ({
            ...prev,
            specializations: normalizeServiceSelections(next),
          }));
        }}
        fieldStyles={fieldStyles}
      />

      <div className="space-y-1.5">
        <label htmlFor="coverLetter" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Briefcase className="h-3.5 w-3.5 text-teal-700/70" />
          Why are you a good fit for this position at Help On Call ?<span className="text-rose-500">*</span>
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          disabled={!isEmailVerified}
          value={formData.coverLetter}
          onChange={handleChange}
          rows={6}
          required
          className={`${fieldStyles} min-h-[180px] resize-none ${!isEmailVerified ? 'opacity-50 pointer-events-none bg-slate-50' : ''}`}
          placeholder="Why are you a good fit for Help On Call?"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="resume" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Upload className="h-3.5 w-3.5 text-teal-700/70" />
          Upload Resume<span className="text-rose-500">*</span>
        </label>
        <div className="relative group">
          <input
            type="file"
            id="resume"
            disabled={!isEmailVerified}
            onChange={handleFileChange}
            className={`absolute inset-0 z-10 h-full w-full opacity-0 ${!isEmailVerified ? 'pointer-events-none' : 'cursor-pointer'}`}
            accept=".pdf,.doc,.docx"
            required={!formData.resume}
          />
          <div className={`
            flex items-center justify-center rounded-md border-2 border-dashed px-4 py-4 transition-all duration-300
            ${!isEmailVerified ? 'border-slate-200 bg-slate-50/50 opacity-50' :
              formData.resume
                ? 'border-teal-700 bg-teal-50/30'
                : 'border-slate-200 bg-slate-50/50 hover:border-teal-400 hover:bg-white hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-0.5'}
          `}>
            {formData.resume ? (
              <div className="flex w-full items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-100 text-teal-700 shadow-inner">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">
                      {formData.resume.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight font-semibold">
                      {(formData.resume.size / 1024 / 1024).toFixed(2)} MB • Ready
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData((prev) => ({ ...prev, resume: null }));
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus:outline-none"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-400 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:text-teal-500">
                  <Upload size={18} />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-slate-700 leading-none mb-1">
                    Select your resume here
                  </span>
                  <p className="text-[11px] text-slate-400 leading-none">
                    PDF or DOCX (Max 2MB)
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Subtle glow effect on group hover */}
          <div className="absolute -inset-1 -z-10 rounded-md bg-gradient-to-r from-teal-700 to-emerald-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-10" />
        </div>
      </div>

      {submitError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !isEmailVerified}
        className={`btn-primary w-full ${!isEmailVerified ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isSubmitting ? 'Sending Application...' : 'Submit Application'}
      </button>
    </form>
  );
}
