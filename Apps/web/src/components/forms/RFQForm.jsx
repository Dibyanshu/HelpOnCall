import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Calendar, Clock, MapPin, User, Mail, Phone, Info, MessageSquare, X, Navigation } from 'lucide-react';
import MapSelector from './MapSelector';

const serviceGroups = [
  {
    label: 'Nursing Services',
    options: ['Home Care', 'Post-Op Care', 'Palliative Care', 'Wound Care']
  },
  {
    label: 'Hospitality Services',
    options: ['Corporate Housing', 'Elderly Concierge', 'Short-Term Stay', 'Long-Term Stay']
  }
];

const locations = [
  'East York',
  'GTA Neighborhoods',
  'Location Brookline',
  'Satay / Bathries',
  'Toronto',
  'North York',
  'Scarborough',
  'Etobicoke',
];

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
    careType: 'self', // 'self' or 'someone_else'
    personName: '',
    personAge: '',
    personRelation: '',
    startDate: '',
    durationValue: '',
    durationUnit: 'weeks',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dateInputRef = useRef(null);

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
    const { name, value, type, checked } = e.target;

    if (name === 'careDescription') {
      const words = value.trim().split(/\s+/).filter(w => w.length > 0);
      const isAdding = value.length > (formData.careDescription?.length || 0);

      if (isAdding) {
        if (words.length > 100 || value.length > 250) {
          return;
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleService = (option) => {
    setFormData((prev) => {
      const current = prev.serviceCategories;
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, serviceCategories: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-teal-600 shadow-xl shadow-teal-500/20">
          <Check className="h-10 w-10 stroke-[3px]" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Thanks!</h2>
        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-lg text-gray-700 font-medium leading-relaxed">
            Your application has been submitted successfully.
          </p>
          <p className="text-gray-600 bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
            A confirmation message has been sent to your email and sms. Help On Call team will reach out to you shortly.
          </p>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-10 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors bg-white px-6 py-2 rounded-full border border-teal-200 hover:border-teal-700 shadow-sm"
        >
          Send Another Request
        </button>
      </div>
    );
  }

  const fieldStyles = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 transition-all duration-200 bg-white/5 backdrop-blur-sm";

  return (
    <section id="rfq-form" className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          {/* First Name */}
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <User className="h-3.5 w-3.5 text-teal-600/70" />
              First Name
            </label>
            <input
              required
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Ex: John"
              value={formData.firstName}
              onChange={handleChange}
              className={fieldStyles}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <User className="h-3.5 w-3.5 text-teal-600/70" />
              Last Name
            </label>
            <input
              required
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Ex: Doe"
              value={formData.lastName}
              onChange={handleChange}
              className={fieldStyles}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Mail className="h-3.5 w-3.5 text-teal-600/70" />
              Email
            </label>
            <input
              required
              type="email"
              name="email"
              id="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className={fieldStyles}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Phone className="h-3.5 w-3.5 text-teal-600/70" />
              Phone
            </label>
            <input
              required
              type="tel"
              name="phone"
              id="phone"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              className={fieldStyles}
            />
          </div>
        </div>

        {/* Consolidated Location Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Left Column: Postal Code & Address Stack */}
          <div className="space-y-6">
            {/* Postal Code */}
            <div className="space-y-1.5">
              <label htmlFor="postalCode" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <MapPin className="h-4 w-4 text-teal-600/70" />
                Postal Code
              </label>
              <input
                required
                type="text"
                name="postalCode"
                id="postalCode"
                placeholder="Ex: M5E 1A1"
                value={formData.postalCode}
                onChange={handleChange}
                className={fieldStyles}
              />
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Navigation className="h-3.5 w-3.5 text-teal-600/70" />
                Address
              </label>
              <textarea
                name="address"
                id="address"
                rows={5}
                placeholder="Enter full address..."
                value={formData.address}
                onChange={handleChange}
                className={`${fieldStyles} resize-none mb-0`}
              />
            </div>
          </div>

          {/* Right Column: Pin Exact Location Map */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Navigation className="h-3.5 w-3.5 text-teal-600/70" />
              Pin Exact Location (Optional)
            </label>
            <MapSelector 
              onLocationPinned={(confirmedAddress) => {
                setFormData(prev => ({ ...prev, address: confirmedAddress }));
              }} 
            />
          </div>
        </div>

        {/* Service Category Multi-select */}
        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Info className="h-3.5 w-3.5 text-teal-600/70" />
            Service Category
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${fieldStyles} flex min-h-[52px] items-center justify-between text-left cursor-pointer`}
            >
              <div className="flex flex-wrap gap-1.5">
                {formData.serviceCategories.length === 0 ? (
                  <span className="text-gray-400">Select services...</span>
                ) : (
                  formData.serviceCategories.map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 border border-teal-100/50">
                      {cat}
                      <X
                        className="h-3 w-3 hover:text-teal-900 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(cat);
                        }}
                      />
                    </span>
                  ))
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full max-h-80 overflow-y-auto rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
                {serviceGroups.map((group) => (
                  <div key={group.label} className="mb-4 last:mb-0">
                    <h3 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400/80">
                      {group.label}
                    </h3>
                    <div className="space-y-1">
                      {group.options.map((option) => {
                        const isSelected = formData.serviceCategories.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleService(option)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${isSelected
                              ? 'bg-teal-50 text-teal-700 font-bold'
                              : 'text-gray-700 hover:bg-gray-50/80'
                              }`}
                          >
                            {option}
                            {isSelected && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Preference */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">How would you like us to contact you?</label>
          <div className="flex gap-8">
            {['email', 'phone', 'any'].map((pref) => (
              <label key={pref} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="contactPreference"
                  value={pref}
                  checked={formData.contactPreference === pref}
                  onChange={handleChange}
                  className="h-4 w-4 border-gray-200 text-teal-600 focus:ring-teal-600 cursor-pointer transition-all"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 capitalize transition-colors">
                  {pref}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Start Date & Duration */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="startDate" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Calendar className="h-3.5 w-3.5 text-teal-600/70" />
              Tentative Start Date
            </label>
            <div
              className="relative"
            >
              <input
                required
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onKeyDown={(e) => e.preventDefault()}
                onClick={(e) => e.currentTarget.showPicker()}
                className={`${fieldStyles} cursor-pointer`}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Clock className="h-3.5 w-3.5 text-teal-600/70" />
              Duration
            </label>
            <div className="flex gap-2">
              <input
                required
                type="number"
                name="durationValue"
                placeholder="Value"
                value={formData.durationValue}
                onChange={handleChange}
                className={`${fieldStyles} flex-[2]`}
              />
              <div className="relative flex-[4]">
                <select
                  name="durationUnit"
                  value={formData.durationUnit}
                  onChange={handleChange}
                  className={`${fieldStyles} cursor-pointer appearance-none pr-10`}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Care for Type */}
        <div className="space-y-4 rounded-2xl bg-teal-50/10 border border-teal-100/20">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Care needed for self:</label>
            <div className="flex gap-8">
              {[
                { label: 'Yes', value: 'self' },
                { label: 'No', value: 'someone_else' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="careType"
                    value={option.value}
                    checked={formData.careType === option.value}
                    onChange={handleChange}
                    className="h-4.5 w-4.5 border-gray-200 text-teal-600 focus:ring-teal-600 cursor-pointer transition-all"
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-teal-800 transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formData.careType === 'someone_else' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">FullName</label>
                <input
                  required
                  type="text"
                  name="personName"
                  placeholder="Ex: Mary Doe"
                  value={formData.personName}
                  onChange={handleChange}
                  className={fieldStyles}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Age</label>
                  <input
                    required
                    type="number"
                    name="personAge"
                    placeholder="Ex: 75"
                    value={formData.personAge}
                    onChange={handleChange}
                    className={fieldStyles}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Relation</label>
                  <div className="relative">
                    <select
                      required
                      name="personRelation"
                      value={formData.personRelation}
                      onChange={handleChange}
                      className={`${fieldStyles} appearance-none cursor-pointer pr-10`}
                    >
                      <option value="">Select Relation</option>
                      {relations.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <label htmlFor="careDescription" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <MessageSquare className="h-3.5 w-3.5 text-teal-600/70" />
              Description of care needed
            </label>
            <span className={`text-[10px] font-bold ${getWordCount(formData.careDescription) >= 100 || (formData.careDescription?.length || 0) >= 250 ? 'text-red-500' : 'text-gray-400'}`}>
              {getWordCount(formData.careDescription)}/100 words or {(formData.careDescription?.length || 0)}/250 chars
            </span>
          </div>
          <textarea
            required
            name="careDescription"
            id="careDescription"
            rows={4}
            placeholder="Tell us a bit more about the care required..."
            value={formData.careDescription}
            onChange={handleChange}
            className={`${fieldStyles} resize-none`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-1/2 flex items-center justify-center rounded-xl bg-white border border-gray-200 px-6 py-4 text-base font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="relative group w-full sm:w-1/2 overflow-hidden rounded-xl bg-teal-700 px-6 py-4 text-base font-bold text-white shadow-xs shadow-teal-500/20 transition-all hover:bg-teal-800 hover:shadow-teal-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center justify-center">
              Submit
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out" />
          </button>
        </div>
      </form>
    </section>
  );
}
