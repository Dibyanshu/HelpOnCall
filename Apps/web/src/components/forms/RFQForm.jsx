import { useState } from 'react';
import { Check, ChevronDown, Calendar, Clock, MapPin, User, Mail, Phone, MessageSquare, Navigation, Cake, UsersRound, Globe, Loader2, AlertCircle } from 'lucide-react';
import GoogleMapSelector from './GoogleMapSelector';
import ServiceCategorySelect from './ServiceCategorySelect';
import { validateEmail, validatePhone, validateTorontoPostalCode, validateRequired } from '../../utils/validation';

const relations = ['Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Friend', 'Other'];

export default function RFQForm({ onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    location: '',
    serviceCategories: [],
    contactPreference: 'email',
    careDescription: '',
    careType: 'self',
    personName: '',
    personAge: '',
    personRelation: '',
    startDate: '',
    durationValue: '',
    durationUnit: 'weeks',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value, currentFormData = formData) => {
    let error = '';
    switch (name) {
      case 'firstName':
        error = validateRequired(value, 'First Name');
        break;
      case 'lastName':
        error = validateRequired(value, 'Last Name');
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'postalCode':
        error = validateTorontoPostalCode(value);
        break;
      case 'address':
        error = validateRequired(value, 'Street Address');
        break;
      case 'startDate':
        error = validateRequired(value, 'Start Date');
        break;
      case 'durationValue':
        error = validateRequired(value, 'Duration Limit');
        if (value && value <= 0) error = 'Duration must be greater than 0';
        break;
      case 'careDescription':
        error = validateRequired(value, 'Care Description');
        break;
      case 'serviceCategories':
        if (!value || value.length === 0) error = 'Please select at least one service category';
        break;
      case 'personName':
        if (currentFormData.careType === 'someone_else') error = validateRequired(value, 'Recipient Name');
        break;
      case 'personAge':
        if (currentFormData.careType === 'someone_else') {
          error = validateRequired(value, 'Age');
          if (value && (value < 0 || value > 120)) error = 'Enter a valid age (0-120)';
        }
        break;
      case 'personRelation':
        if (currentFormData.careType === 'someone_else') error = validateRequired(value, 'Relation');
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'careDescription') {
      const words = value.trim().split(/\s+/).filter(w => w.length > 0);
      const isAdding = value.length > (formData.careDescription?.length || 0);
      if (isAdding && (words.length >= 101 || value.length >= 251)) return;
    }

    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // If careType switches to "self", clear errors for someone_else fields
      if (name === 'careType' && newValue === 'self') {
        setErrors(prevErrs => {
          const newErrs = { ...prevErrs };
          delete newErrs.personName;
          delete newErrs.personAge;
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
    setIsSubmitting(true);
    // Simulate API call for premium feel
    await new Promise(r => setTimeout(r, 1200));
    console.log('Form submitted:', formData);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
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

  const getFieldStyles = (errorName) => {
    const hasError = errors[errorName];
    return `block w-full rounded-lg border bg-white py-2 px-3 text-slate-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 text-sm ${hasError
      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20'
      : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10'
      }`;
  };

  const labelStyles = "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1";

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <p className="error-msg flex items-center gap-1 text-[10px] text-rose-500 mt-1 font-medium animate-in fade-in slide-in-from-top-0.5 duration-200">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    );
  };

  return (
    <section id="rfq-form" className="bg-transparent animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>

        {/* Row 1: Primary Contact Identity */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-0">
            <label htmlFor="firstName" className={labelStyles}>
              <User className="h-3.5 w-3.5 text-teal-600/60" />
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Ex: John"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldStyles('firstName')}
            />
            <ErrorMessage error={errors.firstName} />
          </div>

          <div className="space-y-0">
            <label htmlFor="lastName" className={labelStyles}>
              <User className="h-3.5 w-3.5 text-teal-600/60" />
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Ex: Doe"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldStyles('lastName')}
            />
            <ErrorMessage error={errors.lastName} />
          </div>

          <div className="space-y-0">
            <label htmlFor="email" className={labelStyles}>
              <Mail className="h-3.5 w-3.5 text-teal-600/60" />
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="email"
              name="email"
              id="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldStyles('email')}
            />
            <ErrorMessage error={errors.email} />
          </div>

          <div className="space-y-0">
            <label htmlFor="phone" className={labelStyles}>
              <Phone className="h-3.5 w-3.5 text-teal-600/60" />
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="tel"
              name="phone"
              id="phone"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldStyles('phone')}
            />
            <ErrorMessage error={errors.phone} />
          </div>
        </div>

        {/* Contact & Postal row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Postal Code */}
          <div className="space-y-1">
            <label htmlFor="postalCode" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-700">
              <MapPin className="h-3.5 w-3.5 text-teal-600/70" />
              Postal Code <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              name="postalCode"
              id="postalCode"
              placeholder="Ex: M5E 1A1"
              value={formData.postalCode}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldStyles('postalCode')}
            />
            <ErrorMessage error={errors.postalCode} />
          </div>

          <div className="lg:col-span-3 flex flex-col justify-start">
            <label className={`${labelStyles} invisible pointer-events-none`} aria-hidden="true">&nbsp;</label>
            <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-10 sm:justify-start mt-[-2px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-700">Preferred Contact Method</label>
              <div className="flex gap-8">
                {['email', 'phone', 'any'].map((pref) => (
                  <label key={pref} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="contactPreference"
                        value={pref}
                        checked={formData.contactPreference === pref}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded-full border-2 border-slate-200 peer-checked:border-teal-600 transition-all" />
                      <div className="absolute h-2.5 w-2.5 rounded-full bg-teal-600 opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-teal-900 capitalize transition-colors">
                      {pref}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Physical Location Verified */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-0">
            <label htmlFor="address" className={labelStyles}>
              <Navigation className="h-3.5 w-3.5 text-teal-600/60" />
              Street Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="address"
              id="address"
              placeholder="Enter full address where service is required"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldStyles('address')} resize-none h-[110px] leading-relaxed`}
            />
            <ErrorMessage error={errors.address} />
          </div>

          <div className="space-y-0">
            <label className={labelStyles}>
              <MapPin className="h-3.5 w-3.5 text-teal-600/60" />
              Pin Precision Location (Optional)
            </label>
            <div className="h-[110px] rounded-lg overflow-hidden border border-gray-200">
              <GoogleMapSelector
                initializeCountryBound="ca"
                postalCodeToPin={formData.postalCode}
                onLocationPinned={(confirmedAddress) => {
                  setFormData(prev => ({ ...prev, address: confirmedAddress }));
                  if (errors.address) {
                    setErrors(prev => ({ ...prev, address: '' }));
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Service Scope & Context */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-0">
            <ServiceCategorySelect
              value={formData.serviceCategories}
              onChange={(next) => {
                setFormData((prev) => ({ ...prev, serviceCategories: next }));
                if (errors.serviceCategories && next.length > 0) {
                  setErrors(prev => ({ ...prev, serviceCategories: '' }));
                }
              }}
              fieldStyles={`${getFieldStyles('serviceCategories')} min-h-[80px] bg-white`}
            />
            <ErrorMessage error={errors.serviceCategories} />
          </div>
          <div className="space-y-0">
            <div className="flex justify-between items-end mb-1.5 ml-1">
              <label htmlFor="careDescription" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-700">
                <MessageSquare className="h-3.5 w-3.5 text-teal-600/60" />
                Additional Care Details <span className="text-rose-500">*</span>
              </label>
              {/* Dual counter — highlight whichever limit is closer */}
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getWordCount(formData.careDescription) >= 100 ? 'bg-rose-50 text-rose-500' :
                  getWordCount(formData.careDescription) >= 80 ? 'bg-amber-50 text-amber-500' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                  {getWordCount(formData.careDescription)}/100 words
                </span>
                <span className="text-[8px] text-slate-300 font-bold">or</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${(formData.careDescription?.length || 0) >= 250 ? 'bg-rose-50 text-rose-500' :
                  (formData.careDescription?.length || 0) >= 200 ? 'bg-amber-50 text-amber-500' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                  {formData.careDescription?.length || 0}/250 chars
                </span>
              </div>
            </div>
            <textarea
              required
              name="careDescription"
              id="careDescription"
              placeholder="Provide a brief overview of your specific requirements..."
              value={formData.careDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${getFieldStyles('careDescription')} resize-none h-[80px] leading-relaxed`}
            />
            <ErrorMessage error={errors.careDescription} />
          </div>
        </div>

        {/* Row 5: Timeline & Patient Logic */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-0">
            <label htmlFor="startDate" className={labelStyles}>
              <Calendar className="h-3.5 w-3.5 text-teal-600/60" />
              Tentative Commencement <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <input
                required
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={(e) => e.preventDefault()}
                onClick={(e) => e.currentTarget.showPicker()}
                className={`${getFieldStyles('startDate')} cursor-pointer pr-10`}
              />
              <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
            </div>
            <ErrorMessage error={errors.startDate} />
          </div>

          <div className="space-y-0">
            <label className={labelStyles}>
              <Clock className="h-3.5 w-3.5 text-teal-600/60" />
              Estimated Duration <span className="text-rose-500">*</span>
            </label>
            <div className={`flex overflow-hidden rounded-lg border bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 transition-all duration-200 h-[38px] items-stretch ${errors.durationValue ? 'border-rose-400 ring-2 ring-rose-500/10 bg-rose-50/20' : 'border-gray-200'}`}>
              <input
                required
                type="number"
                name="durationValue"
                placeholder="Val"
                value={formData.durationValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className="flex-[1] bg-transparent min-w-0 border-0 py-0 px-3 text-sm text-slate-800 placeholder:text-gray-400 focus:ring-0 outline-none"
              />
              <div className="self-stretch w-px bg-gray-200" />
              <div className="relative flex-[2]">
                <select
                  name="durationUnit"
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

          <div className="lg:col-span-2 flex flex-col justify-start">
            <label className={`${labelStyles} invisible pointer-events-none`} aria-hidden="true">&nbsp;</label>
            <div className="bg-teal-50/60 rounded-lg px-4 py-2.5 border border-teal-100/60 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between h-[38px] mt-[-2px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-teal-700">Self-Care Requirement?</label>
              <div className="flex gap-10">
                {[
                  { label: 'Yes', value: 'self' },
                  { label: 'No', value: 'someone_else' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="careType"
                        value={option.value}
                        checked={formData.careType === option.value}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded-full border-2 border-teal-200 peer-checked:border-teal-600 transition-all" />
                      <div className="absolute h-2.5 w-2.5 rounded-full bg-teal-600 opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" />
                    </div>
                    <span className="text-sm font-bold text-teal-900/80 group-hover:text-teal-900 capitalize transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Patient Intelligence (Someone Else) */}
        {formData.careType === 'someone_else' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300 xl:col-span-4 mt-2 mb-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="md:col-span-2 space-y-0">
                <label htmlFor="personName" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1.5 ml-1">
                  <User className="h-3.5 w-3.5 text-teal-600/60" />
                  Full Name of Recipient <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="personName"
                  id="personName"
                  placeholder="Ex: Mary Doe"
                  value={formData.personName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldStyles('personName')}
                />
                <ErrorMessage error={errors.personName} />
              </div>
              <div className="space-y-0">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1.5 ml-1">
                  <Cake className="h-3.5 w-3.5 text-teal-600/60" />
                  Current Age <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  name="personAge"
                  id="personAge"
                  placeholder="Ex: 75"
                  value={formData.personAge}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldStyles('personAge')}
                />
                <ErrorMessage error={errors.personAge} />
              </div>
              <div className="space-y-0">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1.5 ml-1">
                  <UsersRound className="h-3.5 w-3.5 text-teal-600/60" />
                  Primary Relationship <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    name="personRelation"
                    id="personRelation"
                    value={formData.personRelation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${getFieldStyles('personRelation')} appearance-none cursor-pointer pr-10`}
                  >
                    <option value="">Select Relation</option>
                    {relations.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                <ErrorMessage error={errors.personRelation} />
              </div>
            </div>
          </div>
        )}

        {/* Global Action Terminal */}
        <div className="flex items-center justify-end gap-4 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn-secondary text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest disabled:opacity-50"
          >
            Cancel Application
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary min-w-[180px] py-2.5 text-xs tracking-widest uppercase flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm & Submit Request'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

