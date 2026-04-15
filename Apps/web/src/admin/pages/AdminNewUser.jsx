import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CalendarCheck, CalendarDays, ChevronDown,
  Hash, Info, Lock, Mail, Shield, User, UserPlus, Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../admin/auth/AdminAuthContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import {
  createInitialFieldErrors,
  hasAnyFieldErrors,
  normalizeZodFieldErrors,
} from '../../admin/utils/formFieldErrors.js';
import {
  validateEmail,
  validateFullName,
  validateDateOfBirth,
  validateDateOfJoining,
  validatePassword,
  validateStaffId,
  validateRequired,
} from '../../utils/validation.js';
import { buildNewStaffTemplate } from './email-templates/newStaff.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const PWD_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PWD_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const PWD_DIGITS = '0123456789';
const PWD_SPECIAL = '!@#$%^&*';

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function formatDateInputTyping(value) {
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
  return formattedValue;
}

function toIsoDateFromDisplay(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return '';
  const [mm, dd, yyyy] = value.split('/').map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  if (
    date.getFullYear() !== yyyy ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return '';
  }
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function toDisplayDateFromIso(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const [yyyy, mm, dd] = value.split('-');
  return `${mm}/${dd}/${yyyy}`;
}

function getTodayDateForInput() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return formatDateForDisplay(now);
}

function openDatePicker(ref) {
  if (ref.current?.showPicker) {
    ref.current.showPicker();
  }
}

function generatePassword() {
  const all = PWD_UPPER + PWD_LOWER + PWD_DIGITS + PWD_SPECIAL;
  const required = [
    PWD_UPPER[Math.floor(Math.random() * PWD_UPPER.length)],
    PWD_LOWER[Math.floor(Math.random() * PWD_LOWER.length)],
    PWD_DIGITS[Math.floor(Math.random() * PWD_DIGITS.length)],
    PWD_SPECIAL[Math.floor(Math.random() * PWD_SPECIAL.length)],
  ];
  const extra = Array.from({ length: 6 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...required, ...extra].sort(() => Math.random() - 0.5).join('');
}

function deriveStaffId(personalEmail, dateOfJoining) {
  const prefix = personalEmail.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
  if (!prefix || !dateOfJoining) return prefix;
  const d = new Date(dateOfJoining);
  if (isNaN(d.getTime())) return prefix;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${prefix}${mm}${yy}`;
}

function createInitialForm() {
  return {
    name: '',
    personalEmail: '',
    gender: '',
    dateOfBirth: '',
    dateOfJoining: getTodayDateForInput(),
    role: 'content_publisher',
    password: '',
    staffId: '',
    isActive: true,
    createAnotherRecord: false,
  };
}

const initialForm = createInitialForm();

const initialFieldErrors = createInitialFieldErrors([
  'name', 'personalEmail', 'gender', 'dateOfBirth',
  'dateOfJoining', 'role', 'password', 'staffId',
]);

// Hover-based info tooltip — no click, no JS state
function InfoTooltip({ children, align = 'left' }) {
  const tooltipRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setIsOpen(false);
      }
    };

    setIsDesktop(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDesktop || !isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (!tooltipRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDesktop, isOpen]);

  const visibilityClasses = isDesktop
    ? 'invisible opacity-0 group-hover:visible group-hover:opacity-100'
    : isOpen
      ? 'visible opacity-100'
      : 'invisible opacity-0 pointer-events-none';

  return (
    <div ref={tooltipRef} className="group relative inline-flex pb-1">
      <button
        type="button"
        onClick={() => {
          if (!isDesktop) {
            setIsOpen((prev) => !prev);
          }
        }}
        className="h-4 w-4 rounded-full bg-slate-100 hover:bg-teal-50 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-colors"
        aria-label="More information"
        aria-expanded={isDesktop ? undefined : isOpen}
      >
        <Info className="h-2.5 w-2.5" />
      </button>
      <div
        className={`absolute ${align === 'right' ? 'right-0 lg:right-0' : 'left-0 lg:left-0'} top-5 z-50 w-64 max-w-[calc(100vw-2rem)] lg:max-w-[20rem] break-words rounded-md border border-slate-200 bg-white p-3 shadow-xl text-xs text-slate-700
          max-lg:left-1/2 max-lg:right-auto max-lg:-translate-x-1/2 ${visibilityClasses} transition-opacity duration-150`}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminNewUser() {
  const [formData, setFormData] = useState(() => ({ ...initialForm, password: generatePassword() }));
  const [roleOptions, setRoleOptions] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffIdEdited, setStaffIdEdited] = useState(false);
  const dateOfBirthPickerRef = useRef(null);
  const dateOfJoiningPickerRef = useRef(null);

  const { token, signOut } = useAdminAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dobMaxDateObj = new Date(today);
  dobMaxDateObj.setFullYear(dobMaxDateObj.getFullYear() - 18);
  const dobMinDateObj = new Date(today);
  dobMinDateObj.setFullYear(dobMinDateObj.getFullYear() - 60);
  const dobMinDate = formatDateForInput(dobMinDateObj);
  const dobMaxDate = formatDateForInput(dobMaxDateObj);

  // Work email suffix — displayed in Staff ID input group
  const staffEmail = formData.staffId ? `${formData.staffId.toLowerCase()}@helponcall.com` : '';

  const validateField = (name, value) => {
    switch (name) {
      case 'name': return validateFullName(value);
      case 'personalEmail': return validateEmail(value);
      case 'gender': return validateRequired(value, 'Gender');
      case 'dateOfBirth': {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          return 'Use format MM/DD/YYYY';
        }
        const isoValue = toIsoDateFromDisplay(value);
        if (!isoValue) {
          return 'Please enter a valid date of birth';
        }
        const baseError = validateDateOfBirth(isoValue);
        if (baseError) return baseError;
        if (isoValue < dobMinDate || isoValue > dobMaxDate) {
          return 'Date of birth must be between 18 and 60 years ago';
        }
        return '';
      }
      case 'dateOfJoining': {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          return 'Use format MM/DD/YYYY';
        }
        const isoValue = toIsoDateFromDisplay(value);
        if (!isoValue) {
          return 'Please enter a valid date of joining';
        }
        return validateDateOfJoining(isoValue);
      }
      case 'role': return validateRequired(value, 'Assigned Role');
      case 'password': return validatePassword(value);
      case 'staffId': return validateStaffId(value);
      default: return '';
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!(name in initialFieldErrors)) return;
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error ? [error] : [] }));
  };

  const fieldClass = (name) => {
    const hasError = fieldErrors[name]?.length > 0;
    return `block w-full rounded-md border bg-white py-2 px-3 text-sm text-slate-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 ${
      hasError
        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20'
        : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10'
    }`;
  };

  const groupClass = (name) => {
    const hasError = fieldErrors[name]?.length > 0;
    return `flex h-[38px] items-stretch overflow-hidden rounded-md border bg-white transition-all duration-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/10 ${
      hasError
        ? 'border-rose-400 ring-2 ring-rose-500/10 bg-rose-50/20 focus-within:border-rose-500 focus-within:ring-rose-500/10'
        : 'border-gray-200'
    }`;
  };

  const loadRoles = useCallback(async () => {
    setErrorMessage('');
    setIsLoadingRoles(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/roles`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users/new' } } });
        return;
      }
      if (!response.ok) throw new Error(data?.message || 'Failed to load roles.');
      const nextRoles = Array.isArray(data?.data) ? data.data : [];
      setRoleOptions(nextRoles);
      setFormData((prev) => {
        if (nextRoles.some((r) => r.value === prev.role)) return prev;
        return { ...prev, role: nextRoles[0]?.value || '' };
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load roles.');
    } finally {
      setIsLoadingRoles(false);
    }
  }, [navigate, signOut, token]);

  useEffect(() => { void loadRoles(); }, [loadRoles]);

  // Auto-derive staffId unless admin has manually edited it
  useEffect(() => {
    if (staffIdEdited) return;
    const joiningIso = toIsoDateFromDisplay(formData.dateOfJoining);
    const auto = deriveStaffId(formData.personalEmail, joiningIso || formData.dateOfJoining);
    setFormData((prev) => ({ ...prev, staffId: auto }));
  }, [formData.personalEmail, formData.dateOfJoining, staffIdEdited]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    // Clear error as soon as the field is touched again
    if (name in initialFieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }
    if (name === 'staffId') setStaffIdEdited(true);

    let nextValue = type === 'checkbox' ? checked : value;
    if (name === 'dateOfBirth' || name === 'dateOfJoining') {
      nextValue = formatDateInputTyping(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleReset = () => {
    setFormData((prev) => ({
      ...createInitialForm(),
      password: generatePassword(),
      createAnotherRecord: prev.createAnotherRecord,
    }));
    setFieldErrors(initialFieldErrors);
    setErrorMessage('');
    setStaffIdEdited(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (isLoadingRoles || !formData.role) {
      setErrorMessage('Roles are still loading. Please try again in a moment.');
      return;
    }

    // Client-side validation — run all fields before hitting the API
    const fields = ['name', 'personalEmail', 'gender', 'dateOfBirth', 'dateOfJoining', 'role', 'password', 'staffId'];
    const nextErrors = { ...initialFieldErrors };
    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) nextErrors[field] = [error];
    });

    if (hasAnyFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors(initialFieldErrors);
    setIsSubmitting(true);
    try {
      const newStaffTemplate = buildNewStaffTemplate({
        fullName: formData.name,
        personalEmail: formData.personalEmail,
        staffEmail,
        password: formData.password,
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.name,
          personalEmail: formData.personalEmail,
          gender: formData.gender,
          dateOfBirth: toIsoDateFromDisplay(formData.dateOfBirth),
          dateOfJoining: toIsoDateFromDisplay(formData.dateOfJoining),
          staffId: formData.staffId,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
          newStaffTemplate,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users/new' } } });
        return;
      }
      if (!response.ok) {
        let nextFieldErrors = { ...initialFieldErrors };
        if (response.status === 400) {
          const zodMapped = normalizeZodFieldErrors(data, { fullName: [], personalEmail: [], password: [], role: [], staffId: [] });
          nextFieldErrors = {
            ...nextFieldErrors,
            name: zodMapped.fullName ?? [],
            personalEmail: zodMapped.personalEmail ?? [],
            password: zodMapped.password ?? [],
            role: zodMapped.role ?? [],
            staffId: zodMapped.staffId ?? [],
          };
        }
        if (response.status === 409) {
          nextFieldErrors = {
            ...nextFieldErrors,
            ...(data?.message?.toLowerCase().includes('email')
              ? { personalEmail: [data?.message || 'A user with this email already exists.'] }
              : { staffId: [data?.message || 'A staff member with this ID already exists.'] }),
          };
        }
        const hasInlineErrors = hasAnyFieldErrors(nextFieldErrors);
        setFieldErrors(nextFieldErrors);
        if (hasInlineErrors) {
          toast.error(data?.message || 'Failed to create staff member.');
          return;
        }
        throw new Error(data?.message || 'Failed to create staff member.');
      }

      if (formData.createAnotherRecord) {
        toast.success('Staff record created successfully');
        setFormData((prev) => ({
          ...createInitialForm(),
          password: generatePassword(),
          createAnotherRecord: prev.createAnotherRecord,
        }));
        setFieldErrors(initialFieldErrors);
        setErrorMessage('');
        setStaffIdEdited(false);
        return;
      }

      navigate('/admin/users', {
        replace: true,
        state: { message: 'Staff record created successfully' },
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create staff member.');
      toast.error(error.message || 'Failed to create staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-1">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-md border border-slate-200 bg-white p-3 shadow-md sm:p-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 tracking-tight">New Staff Details</h2>
            </div>
          </div>
          <Link to="/admin/users" className="btn-secondary gap-2 border border-slate-300 px-6 transition-all">
            <ArrowLeft size={16} />
            Cancel & Return
          </Link>
        </div>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="rounded-md border border-slate-200 bg-white p-3 shadow-md sm:p-3 space-y-6"
        aria-label="Create staff member form"
      >
        {/* ── Row 1: Full Name | Personal Email | Gender | Date of Birth ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700 mb-4">Personal Information</p>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

            <div className="space-y-1.5">
              <label htmlFor="name" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <User className="h-3.5 w-3.5 text-teal-600/70" />
                Full Name
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={2}
                className={fieldClass('name')}
                placeholder="Jane Doe"
              />
              {fieldErrors.name?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="personalEmail" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Mail className="h-3.5 w-3.5 text-teal-600/70" />
                Personal Email
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <input
                id="personalEmail"
                name="personalEmail"
                type="email"
                value={formData.personalEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={fieldClass('personalEmail')}
                placeholder="jane@gmail.com"
              />
              {fieldErrors.personalEmail?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.personalEmail[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gender" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Users className="h-3.5 w-3.5 text-teal-600/70" />
                Gender
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`${fieldClass('gender')} appearance-none cursor-pointer pr-10`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {fieldErrors.gender?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.gender[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="dateOfBirth" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5 text-teal-600/70" />
                  Date of Birth
                  <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <InfoTooltip align="right">
                  <p className="font-bold text-slate-800 mb-2 text-[11px] uppercase tracking-wide">Date of Birth Rule</p>
                  <p className="text-slate-600 leading-relaxed">
                    The person must be between <span className="font-semibold text-slate-700">18 - 60 years</span> of age, as of today.
                  </p>
                </InfoTooltip>
              </div>
              <div className="relative group">
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="MM/DD/YYYY"
                  autoComplete="off"
                  onClick={() => openDatePicker(dateOfBirthPickerRef)}
                  required
                  className={`${fieldClass('dateOfBirth')} pr-10 cursor-pointer`}
                />
                <input
                  type="date"
                  ref={dateOfBirthPickerRef}
                  min={dobMinDate}
                  max={dobMaxDate}
                  className="sr-only"
                  onChange={(e) => {
                    const formatted = toDisplayDateFromIso(e.target.value);
                    if (!formatted) return;
                    setFormData((prev) => ({ ...prev, dateOfBirth: formatted }));
                    if (fieldErrors.dateOfBirth?.length > 0) {
                      setFieldErrors((prev) => ({ ...prev, dateOfBirth: [] }));
                    }
                  }}
                />
                <CalendarDays
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                />
              </div>
              {fieldErrors.dateOfBirth?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.dateOfBirth[0]}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* ── Row 2 (merged): Date of Joining | Assigned Role | Initial Password | Staff ID ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700 mb-4">Employment & System Account</p>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

            <div className="space-y-1.5">
              <label htmlFor="dateOfJoining" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <CalendarCheck className="h-3.5 w-3.5 text-teal-600/70" />
                Date of Joining
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <div className="relative group">
                <input
                  id="dateOfJoining"
                  name="dateOfJoining"
                  type="text"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="MM/DD/YYYY"
                  autoComplete="off"
                  onClick={() => openDatePicker(dateOfJoiningPickerRef)}
                  required
                  className={`${fieldClass('dateOfJoining')} pr-10 cursor-pointer`}
                />
                <input
                  type="date"
                  ref={dateOfJoiningPickerRef}
                  className="sr-only"
                  onChange={(e) => {
                    const formatted = toDisplayDateFromIso(e.target.value);
                    if (!formatted) return;
                    setFormData((prev) => ({ ...prev, dateOfJoining: formatted }));
                    if (fieldErrors.dateOfJoining?.length > 0) {
                      setFieldErrors((prev) => ({ ...prev, dateOfJoining: [] }));
                    }
                  }}
                />
                <CalendarCheck
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                />
              </div>
              {fieldErrors.dateOfJoining?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.dateOfJoining[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="role" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Shield className="h-3.5 w-3.5 text-teal-600/70" />
                Assigned Role
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  disabled={isLoadingRoles || roleOptions.length === 0}
                  className={`${fieldClass('role')} appearance-none cursor-pointer pr-10`}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {isLoadingRoles && <p className="mt-1 text-[10px] text-slate-500 italic">Syncing roles from server...</p>}
              {!isLoadingRoles && roleOptions.length === 0 && (
                <button type="button" onClick={loadRoles} className="mt-2 text-xs font-bold text-rose-600 underline">
                  Retry loading roles
                </button>
              )}
              {fieldErrors.role?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.role[0]}
                </p>
              )}
            </div>

            {/* Initial Password with hover info tooltip */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Lock className="h-3.5 w-3.5 text-teal-600/70" />
                  Initial Password
                  <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <InfoTooltip>
                  <p className="font-bold text-slate-800 mb-2 text-[11px] uppercase tracking-wide">Password Rules</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-1.5"><span className="text-teal-600 font-bold">•</span>At least 8 characters</li>
                    <li className="flex items-start gap-1.5"><span className="text-teal-600 font-bold">•</span>At least 1 uppercase letter (A–Z)</li>
                    <li className="flex items-start gap-1.5"><span className="text-teal-600 font-bold">•</span>At least 1 lowercase letter (a–z)</li>
                    <li className="flex items-start gap-1.5"><span className="text-teal-600 font-bold">•</span>At least 1 number (0–9)</li>
                    <li className="flex items-start gap-1.5"><span className="text-teal-600 font-bold">•</span>At least 1 special character from: <span className="font-mono text-teal-700">! @ # $ % ^ &amp; *</span></li>
                  </ul>
                </InfoTooltip>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={8}
                autoComplete="new-password"
                className={fieldClass('password')}
                placeholder="Auto-generated"
              />
              {fieldErrors.password?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Staff ID + @helponcall.com combined group with hover info tooltip */}
            <div className="space-y-1.5 hidden">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="staffId" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Hash className="h-3.5 w-3.5 text-teal-600/70" />
                  Staff ID
                  <span className="text-rose-500" aria-hidden="true">*</span>
                </label>
                <InfoTooltip align="right">
                  <p className="font-bold text-slate-800 mb-2 text-[11px] uppercase tracking-wide">Auto-Generation Rule</p>
                  <p className="text-slate-600 leading-relaxed">
                    Staff ID is derived from the <span className="font-semibold text-slate-700">Personal Email prefix</span> (everything before @) combined with the <span className="font-semibold text-slate-700">2-digit month</span> and <span className="font-semibold text-slate-700">2-digit year</span> of joining.
                  </p>
                  <p className="mt-2 font-mono bg-slate-50 rounded px-2 py-1 text-[10px] text-slate-500">
                    jane@gmail.com + Apr 2026 → jane0426
                  </p>
                  <p className="mt-1.5 text-slate-400 text-[10px]">You can still manually edit this field.</p>
                </InfoTooltip>
              </div>
              {/* Combined input group: editable Staff ID + readonly @helponcall.com suffix */}
              <div className={groupClass('staffId')}>
                <input
                  id="staffId"
                  name="staffId"
                  type="text"
                  value={formData.staffId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className="h-full flex-1 min-w-0 border-0 bg-transparent py-0 px-3 text-sm text-slate-800 placeholder:text-gray-400 focus:ring-0 outline-none"
                  placeholder="janedoe0426"
                />
                <span
                  aria-hidden="true"
                  className={`inline-flex h-full items-center px-3 border-l text-xs select-none whitespace-nowrap shrink-0 ${
                    fieldErrors.staffId?.length > 0
                      ? 'border-rose-300 bg-rose-50 text-rose-500'
                      : 'border-gray-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  @helponcall.com
                </span>
              </div>
              {fieldErrors.staffId?.length > 0 && (
                <p className="mt-1 text-xs text-red-700" role="alert">
                  {fieldErrors.staffId[0]}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Activation and create-next options */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded-md border-slate-300 accent-teal-700 text-teal-700 focus:ring-teal-700 cursor-pointer"
            />
            <span>Activate account immediately upon creation</span>
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer ml-auto">
            <input
              type="checkbox"
              name="createAnotherRecord"
              checked={formData.createAnotherRecord}
              onChange={handleChange}
              className="h-4 w-4 rounded-md border-slate-300 accent-teal-700 text-teal-700 focus:ring-teal-700 cursor-pointer"
            />
            <span>Create Another Record</span>
          </label>
        </div>

        {errorMessage && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 font-medium" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary flex-1 sm:flex-none justify-center px-8 border border-slate-300"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 sm:flex-none px-8"
          >
            {isSubmitting ? 'Processing...' : 'Register Staff'}
          </button>
        </div>
      </form>
    </div>
  );
}
