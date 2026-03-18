import { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle2, ChevronDown, X } from 'lucide-react';
import { submitEmploymentApplication } from './employmentSubmission';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  specializations: [],
  coverLetter: '',
  resume: null,
};

const SPECIALIZATIONS = [
  'Personal Care',
  'Post-Operative Support',
  'Dementia & Alzheimer\'s Care',
  'Companion Care',
  'Respite Care',
  'Palliative Care',
];

export default function EmploymentForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecToggle = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
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

    if (!formData.resume) {
      setSubmitError('Please upload your resume before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitEmploymentApplication({
        apiBaseUrl: API_BASE_URL,
        formData,
      });

      setIsSubmitted(true);
      setFormData(initialFormData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit your application right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in slide-in-from-bottom-8 duration-700 ease-out flex flex-col items-center bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-full bg-teal-100 opacity-75" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 text-teal-600">
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
            className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95 shadow-lg shadow-slate-200"
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
      className={`mx-auto w-full max-w-2xl space-y-8 rounded-[40px] bg-white p-8 shadow-2xl shadow-slate-200 ring-1 ring-slate-200 transition-all duration-500 lg:p-8 ${isSubmitting ? 'scale-95 opacity-50 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      aria-label="Employment application form"
    >
      <div className="space-y-2 mb-3">
        <h3 className="text-xl font-semibold text-slate-900">Career Application</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="specializations" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
            Specializations
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              id="specializations"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            >
              <span className="truncate">
                {formData.specializations.length > 0
                  ? formData.specializations.join(', ')
                  : 'Select Specializations'}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {SPECIALIZATIONS.map((spec) => {
                    const isSelected = formData.specializations.includes(spec);
                    return (
                      <label
                        key={spec}
                        className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${isSelected ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        <span>{spec}</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          checked={isSelected}
                          onChange={() => handleSpecToggle(spec)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="coverLetter" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
          Cover Letter
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          rows={4}
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
          placeholder="Why are you a good fit for Help On Call?"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="resume" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
          Upload Resume
        </label>
        <div className="relative group">
          <input
            type="file"
            id="resume"
            onChange={handleFileChange}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            accept=".pdf,.doc,.docx"
            required={!formData.resume}
          />
          <div className={`
            flex items-center justify-center rounded-2xl border-2 border-dashed px-4 py-4 transition-all duration-300
            ${formData.resume
              ? 'border-teal-500 bg-teal-50/30'
              : 'border-slate-200 bg-slate-50/50 hover:border-teal-400 hover:bg-white hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-0.5'}
          `}>
            {formData.resume ? (
              <div className="flex w-full items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600 shadow-inner">
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
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 focus:outline-none"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:text-teal-500">
                  <Upload size={18} />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-slate-700 leading-none mb-1">
                    Click or drag resume here
                  </span>
                  <p className="text-[11px] text-slate-400 leading-none">
                    PDF or DOCX (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Subtle glow effect on group hover */}
          <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-10" />
        </div>
      </div>

      {submitError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-teal-700/20 transition-all hover:bg-teal-800 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending Application...' : 'Submit Application'}
      </button>
    </form>
  );
}
