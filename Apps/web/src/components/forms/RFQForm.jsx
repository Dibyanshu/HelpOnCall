import { useState, useRef } from 'react';
import { Check, ChevronDown, Calendar, Clock, MapPin, User, Mail, Phone, Navigation, UsersRound, Loader2, AlertCircle, Info } from 'lucide-react';
import ServiceCategorySelect from '../common/ServiceCategorySelect';
import EmailAddressValidation from '../common/EmailAddressValidation';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation';

const relations = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Friend', 'Uncle', 'Aunt', 'Cousin', 'Niece', 'Nephew'];

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

export default function RFQForm({ onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    serviceCategories: [],
    contactPreference: 'email',
    careType: 'self',
    personName: '',
    personRelation: '',
    startDate: '',
    durationValue: '',
    durationUnit: 'weeks',
    consent: false,
  });
  const startDateRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const validateField = (name, value, currentFormData = formData) => {
    let error = '';
    switch (name) {
      case 'fullName':
        error = validateRequired(value, 'Full Name');
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'address':
        error = validateRequired(value, 'Street Address');
        break;
      case 'startDate':
        error = validateRequired(value, 'Start Date');
        if (!error && value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          error = 'Use format MM/DD/YYYY';
        }
        break;
      case 'durationValue':
        error = validateRequired(value, 'Duration Limit');
        if (value && value <= 0) error = 'Duration must be greater than 0';
        break;
      case 'serviceCategories':
        if (!value || value.length === 0) error = 'Please select at least one service category';
        break;
      case 'personName':
        if (currentFormData.careType === 'someone_else') error = validateRequired(value, 'Recipient Information');
        break;
      case 'personRelation':
        if (currentFormData.careType === 'someone_else') {
          if (!value || value === '' || value === 'Relation') {
            error = 'Relation is required';
          }
        }
        break;
      case 'consent':
        if (!value) error = 'Consent is required to proceed';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    if (name === 'startDate') {
      let v = value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      let formattedValue = '';
      if (v.length > 0) {
        formattedValue = v.slice(0, 2);
        if (v.length > 2) {
          formattedValue += '/' + v.slice(2, 4);
          if (v.length > 4) {
            formattedValue += '/' + v.slice(4, 8);
          }
        }
      }
      newValue = formattedValue;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // If careType switches to "self", clear errors for someone_else fields
      if (name === 'careType' && newValue === 'self') {
        setErrors(prevErrs => {
          const newErrs = { ...prevErrs };
          delete newErrs.personName;
          delete newErrs.personRelation;
          return newErrs;
        });
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value, formData);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const keysToValidate = Object.keys(formData);

    // Explicitly validate arrays like serviceCategories
    const arrayError = validateField('serviceCategories', formData.serviceCategories, formData);
    if (arrayError) newErrors.serviceCategories = arrayError;

    keysToValidate.forEach(key => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstErrorEl = document.querySelector('.error-msg');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!isEmailVerified) {
      setErrors(prev => ({ ...prev, email: 'Email verification is required to submit' }));
      return;
    }

    const payload = {
      ...formData,
      serviceCategories: normalizeServiceSelections(formData.serviceCategories),
    };

    setIsSubmitting(true);
    // Simulate API call for premium feel
    await new Promise(r => setTimeout(r, 1200));
    console.log('Form submitted:', payload);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const hasPostalCode = (text) => {
    if (!text) return false;
    // Detect Canadian postal code (Standard: A1A 1A1 or A1A1A1)
    const postalRegex = /[A-Z]\d[A-Z]\s?\d[A-Z]\d/i;
    return postalRegex.test(text);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-700">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-teal-700 text-white shadow-2xl shadow-teal-500/30 ring-8 ring-teal-50">
          <Check className="h-12 w-12 stroke-[3px]" />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Request Received!</h2>
        <div className="space-y-6 max-w-lg mx-auto">
          <p className="text-xl text-slate-600 font-medium leading-relaxed">
            Your application for a personal statement has been logged in our premium care system.
          </p>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
            <p className="text-gray-700">
              A detailed confirmation and next steps have been sent to <span className="text-teal-700 font-bold">{formData.email}</span>. A care coordinator will be in touch within the next 2 hours.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-12 btn-secondary px-8 py-3 rounded-full text-slate-600 border-slate-200 hover:border-teal-600 hover:text-teal-700 transition-all shadow-lg shadow-black/5"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  const getFieldStyles = (errorName, isDisabled = false) => {
    const hasError = errors[errorName];
    return `block w-full rounded-lg border bg-white py-2 px-3 text-slate-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 text-sm ${hasError
      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20'
      : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50 grayscale pointer-events-none' : ''}`;
  };

  const labelStyles = "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1";

  const ErrorMessage = ({ error, className = "" }) => {
    if (!error) return null;
    return (
      <p className={`error-msg flex items-center gap-1 text-[10px] text-rose-500 mt-1 font-medium animate-in fade-in slide-in-from-top-0.5 duration-200 ${className}`}>
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    );
  };

  return (
    <section id="rfq-form" className="bg-transparent animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-0 gap-y-8 items-start">

          {/* Column 1: Contact Identity & Physical Location */}
          <div className="space-y-5 md:pr-12 md:border-r md:border-slate-100 h-full">
            <EmailAddressValidation
              value={formData.email}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, email: val }));
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              onVerifiedStatusChange={setIsEmailVerified}
              isVerified={isEmailVerified}
              className="mt-2"
            />

            <div className="space-y-0">
              <label htmlFor="fullName" className={labelStyles}>
                <User className="h-3.5 w-3.5 text-teal-600/60" />
                Full Name<span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                required
                type="text"
                name="fullName"
                id="fullName"
                disabled={!isEmailVerified}
                placeholder="Ex: John Doe"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldStyles('fullName', !isEmailVerified)}
              />
              <ErrorMessage error={errors.fullName} />
            </div>

            <div className="space-y-0">
              <label htmlFor="phone" className={labelStyles}>
                <Phone className="h-3.5 w-3.5 text-teal-600/60" />
                Phone Number<span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                required
                type="tel"
                name="phone"
                id="phone"
                disabled={!isEmailVerified}
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldStyles('phone', !isEmailVerified)}
              />
              <ErrorMessage error={errors.phone} />
            </div>

            <div className="space-y-0">
              <div className="flex justify-between items-end mb-1">
                <label htmlFor="address" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700">
                  <Navigation className="h-3.5 w-3.5 text-teal-600/60" />
                  Street Address<span className="text-rose-500 ml-1">*</span>
                </label>
                <div className="relative group flex items-center">
                  <button
                    type="button"
                    disabled={!isEmailVerified || !hasPostalCode(formData.address)}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white active:scale-95 shadow-sm"
                  >
                    <MapPin className="h-3 w-3" />
                    Show In Map
                  </button>
                  {/* Custom Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 w-48 px-2 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] leading-tight rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 text-center translate-y-1 group-hover:translate-y-0">
                    {!hasPostalCode(formData.address)
                      ? "Enter full address along with pincode to enable"
                      : "View pin location on Map"}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full right-4 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-900/90"></div>
                  </div>
                </div>
              </div>
              <textarea
                name="address"
                id="address"
                disabled={!isEmailVerified}
                placeholder="Enter Full Address Where Service Is Required Along With Pincode"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getFieldStyles('address', !isEmailVerified)} resize-none h-[110px] leading-relaxed`}
              />
              <ErrorMessage error={errors.address} />
            </div>

          </div>

          {/* Column 2: Service Scope & Timeline */}
          <div className="space-y-5 md:px-12 md:border-r md:border-slate-100 h-full">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-700">Preferred Contact Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['email', 'phone', 'any'].map((pref) => (
                  <label key={pref} className={`flex items-center gap-2 group bg-gray-50/50 p-2 rounded-lg border border-gray-100 transition-all ${!isEmailVerified ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:bg-white hover:border-teal-100'}`}>
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="radio"
                        name="contactPreference"
                        disabled={!isEmailVerified}
                        value={pref}
                        checked={formData.contactPreference === pref}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="h-4 w-4 rounded-full border-2 border-slate-200 peer-checked:border-teal-600 transition-all font-bold" />
                      <div className="absolute h-2 w-2 rounded-full bg-teal-600 opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 group-hover:text-teal-900 capitalize transition-colors">
                      {pref}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-0">
              <ServiceCategorySelect
                value={formData.serviceCategories}
                disabled={!isEmailVerified}
                onChange={(next) => {
                  const normalizedNext = normalizeServiceSelections(next);

                  setFormData((prev) => ({ ...prev, serviceCategories: normalizedNext }));
                  if (errors.serviceCategories && next.length > 0) {
                    setErrors(prev => ({ ...prev, serviceCategories: '' }));
                  }
                }}
                fieldStyles={`${getFieldStyles('serviceCategories', !isEmailVerified)} bg-white`}
              />
              <ErrorMessage error={errors.serviceCategories} />
            </div>

            <div className="space-y-0">
              <label htmlFor="startDate" className={labelStyles}>
                <Calendar className="h-3.5 w-3.5 text-teal-600/60" />
                Your desired start date<span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  name="startDate"
                  id="startDate"
                  disabled={!isEmailVerified}
                  placeholder="MM/DD/YYYY"
                  autoComplete="off"
                  value={formData.startDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onClick={() => !isEmailVerified ? null : startDateRef.current && startDateRef.current.showPicker()}
                  className={`${getFieldStyles('startDate', !isEmailVerified)} pr-10 ${isEmailVerified ? 'cursor-pointer' : ''}`}
                />
                <input
                  type="date"
                  ref={startDateRef}
                  className="sr-only"
                  onChange={(e) => {
                    const d = e.target.value;
                    if (!d) return;
                    const [y, m, day] = d.split('-');
                    const formatted = `${m}/${day}/${y}`;
                    setFormData(prev => ({ ...prev, startDate: formatted }));
                    if (errors.startDate) setErrors(prev => ({ ...prev, startDate: '' }));
                  }}
                />
                <Calendar
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer group-hover:text-teal-600 transition-colors"
                  onClick={() => startDateRef.current && startDateRef.current.showPicker()}
                />
              </div>
              <ErrorMessage error={errors.startDate} />
            </div>

            <div className="space-y-0">
              <label className={labelStyles}>
                <Clock className="h-3.5 w-3.5 text-teal-600/60" />
                Your expected length of care<span className="text-rose-500 ml-1">*</span>
              </label>
              <div className={`flex overflow-hidden rounded-lg border bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 transition-all duration-200 h-[38px] items-stretch ${errors.durationValue ? 'border-rose-400 ring-2 ring-rose-500/10 bg-rose-50/20' : 'border-gray-200'} ${!isEmailVerified ? 'opacity-50 cursor-not-allowed bg-slate-50 grayscale pointer-events-none' : ''}`}>
                <input
                  required
                  type="number"
                  name="durationValue"
                  disabled={!isEmailVerified}
                  placeholder="Enter Number Of"
                  value={formData.durationValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="flex-[2] bg-transparent min-w-0 border-0 py-0 px-3 text-sm text-slate-800 placeholder:text-gray-400 focus:ring-0 outline-none"
                />
                <div className="self-stretch w-px bg-gray-200" />
                <div className="relative flex-[2]">
                  <select
                    name="durationUnit"
                    disabled={!isEmailVerified}
                    value={formData.durationUnit}
                    onChange={handleChange}
                    className="h-full w-full bg-transparent border-0 py-0 pl-3 pr-9 text-sm text-gray-700 appearance-none cursor-pointer focus:ring-0 outline-none"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <ErrorMessage error={errors.durationValue} />
            </div>
          </div>

          {/* Column 3: Patient Logic & Consent */}
          <div className="space-y-5 md:pl-12">
            <div className="flex flex-col justify-start">
              <label className={labelStyles}>Self-Care Requirement?</label>
              <div className="bg-teal-50/60 rounded-lg px-4 py-2 border border-teal-100/60 flex items-center justify-between h-[42px]">
                <div className="flex gap-8">
                  {[
                    { label: 'Yes', value: 'self' },
                    { label: 'No', value: 'someone_else' },
                  ].map((option) => (
                    <label key={option.value} className={`flex items-center gap-2 group ${!isEmailVerified ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}>
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="careType"
                          disabled={!isEmailVerified}
                          value={option.value}
                          checked={formData.careType === option.value}
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="h-4 w-4 rounded-full border-2 border-teal-200 peer-checked:border-teal-600 transition-all" />
                        <div className="absolute h-2 w-2 rounded-full bg-teal-600 opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" />
                      </div>
                      <span className="text-xs font-bold text-teal-900/80 group-hover:text-teal-900 capitalize transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Conditional Patient Details */}
            {formData.careType === 'someone_else' && (
              <div className="space-y-4 p-4 rounded-xl border border-teal-100 bg-teal-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-0">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1.5 ml-1">
                    <UsersRound className="h-3.5 w-3.5 text-teal-600/60" />
                    Recipient Information<span className="text-rose-500 ml-1">*</span>
                  </label>
                  <div className={`flex overflow-hidden rounded-lg border bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 transition-all duration-200 h-[38px] items-stretch ${errors.personName || errors.personRelation ? 'border-rose-400 ring-2 ring-rose-500/10 bg-rose-50/20' : 'border-gray-200'} ${!isEmailVerified ? 'opacity-50 cursor-not-allowed bg-slate-50 grayscale pointer-events-none' : ''}`}>
                    <input
                      required
                      type="text"
                      name="personName"
                      disabled={!isEmailVerified}
                      placeholder="Recipient Name"
                      value={formData.personName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="flex-[2] bg-transparent min-w-0 border-0 py-0 px-3 text-sm text-slate-800 placeholder:text-gray-400 focus:ring-0 outline-none"
                    />
                    <div className="self-stretch w-px bg-gray-200" />
                    <div className="relative flex-[1.2]">
                      <select
                        required
                        name="personRelation"
                        disabled={!isEmailVerified}
                        value={formData.personRelation}
                        onChange={handleChange}
                        className="h-full w-full bg-transparent border-0 py-0 pl-3 pr-8 text-sm text-gray-700 appearance-none cursor-pointer focus:ring-0 outline-none"
                      >
                        <option value="">Relation</option>
                        {relations.map(rel => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  {(errors.personName || errors.personRelation) && (
                    <ErrorMessage error={errors.personName || errors.personRelation} />
                  )}
                </div>
              </div>
            )}

            {/* Consent Checkbox Section */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm leading-relaxed text-slate-500 text text-justify">
                  By submitting this form, you provide your consent for Help On Call to collect and use the information provided, strictly for the purpose of assessing your needs and delivering the requested care services.
                  <span className="font-bold"> Your information will not be disclosed for any other purpose beyond service delivery.</span>
                </p>
              </div>
              <div className="flex items-start gap-3 px-3">
                <div className="relative flex items-center h-5">
                  <input
                    required
                    id="consent"
                    name="consent"
                    type="checkbox"
                    disabled={!isEmailVerified}
                    checked={formData.consent}
                    onChange={handleChange}
                    className={`h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 ${!isEmailVerified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  />
                </div>
                <label htmlFor="consent" className="text-[11px] font-medium text-slate-700 cursor-pointer select-none">
                  Please confirm your consent to proceed.<span className="text-rose-500 ml-1">*</span>
                </label>
              </div>
              <ErrorMessage className="px-3" error={errors.consent} />
            </div>
          </div>
        </div>

        {/* Global Action Terminal */}
        <div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn-secondary text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isEmailVerified}
            className={`btn-primary min-w-[180px] py-2.5 text-xs tracking-widest uppercase flex items-center justify-center gap-2 ${!isEmailVerified ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

