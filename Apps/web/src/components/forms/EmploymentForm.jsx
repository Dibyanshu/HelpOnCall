import { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle2, ChevronDown, X, Briefcase, Check, User, Phone, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useToast } from '../common/Toast';
import {
  fetchEmploymentSpecializationGroups,
  submitEmploymentApplication,
} from '../../appServices/employmentSubmission';
import { validatePhone as utilValidatePhone } from '../../utils/validation';
import EmailAddressValidation from '../common/EmailAddressValidation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [specializationGroups, setSpecializationGroups] = useState([]);
  const [isLoadingSpecializations, setIsLoadingSpecializations] = useState(true);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const dropdownRef = useRef(null);
  const toast = useToast();

  const selectedSpecializationsData = formData.specializations.map((selection) => {
    const match = specializationGroups
      .flatMap((group) => group.options)
      .find((option) => (
        option.categoryId === selection.categoryId && option.serviceId === selection.serviceId
      ));

    return {
      label: match?.label || `${selection.categoryId}:${selection.serviceId}`,
      icon: match?.icon
    };
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSpecializations() {
      setIsLoadingSpecializations(true);

      try {
        const groups = await fetchEmploymentSpecializationGroups(API_BASE_URL);

        if (!isMounted) {
          return;
        }

        setSpecializationGroups(groups);
      } catch {
        if (!isMounted) {
          return;
        }

        setSpecializationGroups([]);
      } finally {
        if (isMounted) {
          setIsLoadingSpecializations(false);
        }
      }
    }

    void loadSpecializations();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecToggle = (selection) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.some(
        (item) => item.categoryId === selection.categoryId && item.serviceId === selection.serviceId,
      )
        ? prev.specializations.filter(
          (item) => !(
            item.categoryId === selection.categoryId && item.serviceId === selection.serviceId
          ),
        )
        : [...prev.specializations, selection],
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

  const validatePhone = (phone) => {
    const error = utilValidatePhone(phone);
    setPhoneError(error);
    return !error;
  };

  const fieldStyles = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-700 transition-all duration-200";

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in slide-in-from-bottom-8 duration-700 ease-out flex flex-col items-center bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-full bg-teal-100 opacity-75" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 text-teal-700">
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
      className={`mx-auto w-full max-w-2xl space-y-6 rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200 ring-1 ring-slate-200 transition-all duration-500 lg:p-10 ${isSubmitting ? 'scale-95 opacity-50 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      aria-label="Employment application form"
    >
      <div className="space-y-1.5 mb-3">
        <h3 className="text-xl font-semibold text-slate-900">Career Application</h3>
      </div>

      <EmailAddressValidation
        value={formData.email}
        onChange={(val) => setFormData(prev => ({ ...prev, email: val }))}
        onVerifiedStatusChange={setIsEmailVerified}
        isVerified={isEmailVerified}
      />

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <User className="h-3.5 w-3.5 text-teal-700/70" />
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            disabled={!isEmailVerified}
            value={formData.fullName}
            onChange={handleChange}
            required
            className={`${fieldStyles} ${!isEmailVerified ? 'opacity-50 pointer-events-none bg-slate-50' : ''}`}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Phone className="h-3.5 w-3.5 text-teal-700/70" />
            Phone Number
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
            className={`${fieldStyles} ${!isEmailVerified ? 'opacity-50 pointer-events-none bg-slate-50' : ''} ${phoneError ? 'ring-rose-500 border-rose-500 focus:ring-rose-500 text-rose-900 bg-rose-50/50' : ''}`}
            placeholder="+1 (555) 000-0000"
          />
          {phoneError && (
            <p className="mt-1.5 text-[11px] font-semibold text-rose-500 animate-in fade-in slide-in-from-top-1">
              {phoneError}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="specializations" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Briefcase className="h-3.5 w-3.5 text-teal-700/70" />
          Specializations
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            id="specializations"
            type="button"
            disabled={!isEmailVerified}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`${fieldStyles} flex min-h-[52px] items-center justify-between text-left ${!isEmailVerified ? 'opacity-50 pointer-events-none bg-slate-50' : 'cursor-pointer'}`}
          >
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {selectedSpecializationsData.length === 0 ? (
                <span className="text-slate-400">Select Specializations</span>
              ) : (
                formData.specializations.map((selection, index) => {
                  const specData = selectedSpecializationsData[index];
                  const Icon = LucideIcons[specData.icon] || LucideIcons.HelpCircle;
                  return (
                    <span key={`${selection.categoryId}-${selection.serviceId}`} className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 border border-teal-100/50 animate-in zoom-in duration-200">
                      <Icon className="h-3.5 w-3.5" />
                      {specData.label}
                      <X
                        className="h-3 w-3 hover:text-teal-900 cursor-pointer ml-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpecToggle(selection);
                        }}
                      />
                    </span>
                  );
                })
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-2 shadow-2xl animate-in fade-in zoom-in duration-300 ring-1 ring-slate-900/5 origin-top">
              <div className="max-h-80 overflow-y-auto p-1">
                {isLoadingSpecializations ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600/50" />
                  </div>
                ) : null}

                {!isLoadingSpecializations && specializationGroups.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-slate-500">No specializations found.</p>
                ) : null}

                {specializationGroups.map((group) => (
                  <div key={group.label} className="mb-4 last:mb-0 px-1">
                    <h4 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400/80">
                      {group.label}
                    </h4>
                    <div className="space-y-1">
                      {group.options.map((option) => {
                        const selection = {
                          categoryId: option.categoryId,
                          serviceId: option.serviceId,
                        };

                        const isSelected = formData.specializations.some(
                          (item) => (
                            item.categoryId === selection.categoryId
                            && item.serviceId === selection.serviceId
                          ),
                        );

                        return (
                          <button
                            key={`${option.categoryId}-${option.serviceId}`}
                            type="button"
                            onClick={() => handleSpecToggle(selection)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group/item ${isSelected
                              ? 'bg-teal-50 text-teal-700 font-bold shadow-sm shadow-teal-500/5'
                              : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1">
                              <div className={`p-1.5 rounded-md ${isSelected ? 'bg-teal-100/50' : 'bg-gray-100/50 hover:bg-gray-200/50'}`}>
                                {(() => {
                                  const OptionIcon = LucideIcons[option.icon] || LucideIcons.HelpCircle;
                                  return <OptionIcon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />;
                                })()}
                              </div>
                              <span className="text-left">{option.label}</span>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-teal-700 animate-in zoom-in duration-200" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="coverLetter" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Briefcase className="h-3.5 w-3.5 text-teal-700/70" />
          Cover Letter
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          disabled={!isEmailVerified}
          value={formData.coverLetter}
          onChange={handleChange}
          rows={4}
          required
          className={`${fieldStyles} resize-none ${!isEmailVerified ? 'opacity-50 pointer-events-none bg-slate-50' : ''}`}
          placeholder="Why are you a good fit for Help On Call?"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="resume" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Upload className="h-3.5 w-3.5 text-teal-700/70" />
          Upload Resume
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
            flex items-center justify-center rounded-2xl border-2 border-dashed px-4 py-4 transition-all duration-300
            ${!isEmailVerified ? 'border-slate-200 bg-slate-50/50 opacity-50' :
              formData.resume
                ? 'border-teal-700 bg-teal-50/30'
                : 'border-slate-200 bg-slate-50/50 hover:border-teal-400 hover:bg-white hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-0.5'}
          `}>
            {formData.resume ? (
              <div className="flex w-full items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 shadow-inner">
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
          <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-10" />
        </div>
      </div>

      {submitError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
