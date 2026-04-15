import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Mail,
  Shield,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import {
  validateDateOfBirth,
  validateDateOfJoining,
  validateEmail,
  validateFullName,
  validateRequired,
} from '../../utils/validation.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return '';
  const datePart = value.slice(0, 10);
  const [yyyy, mm, dd] = datePart.split('-');
  return `${mm}/${dd}/${yyyy}`;
}

function openDatePicker(ref) {
  if (ref.current?.showPicker) {
    ref.current.showPicker();
  }
}

const ROLE_OPTIONS = [
  { value: 'content_publisher', label: 'Content Publisher' },
  { value: 'resume_reviewer', label: 'Resume Reviewer' },
  { value: 'job_poster', label: 'Job Poster' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export default function AdminEditUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { token, signOut } = useAdminAuth();

  const targetUser = location.state?.targetUser || null;
  const editingUserId = targetUser?.id ?? location.state?.userId ?? null;
  const [dbUser, setDbUser] = useState(targetUser);
  const [roleOptions, setRoleOptions] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: [],
    personalEmail: [],
    gender: [],
    dateOfBirth: [],
    dateOfJoining: [],
    role: [],
  });

  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    gender: '',
    dateOfBirth: '',
    dateOfJoining: '',
    role: 'content_publisher',
  });

  const dateOfBirthPickerRef = useRef(null);
  const dateOfJoiningPickerRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dobMaxDateObj = new Date(today);
  dobMaxDateObj.setFullYear(dobMaxDateObj.getFullYear() - 18);
  const dobMinDateObj = new Date(today);
  dobMinDateObj.setFullYear(dobMinDateObj.getFullYear() - 60);
  const dobMinDate = formatDateForInput(dobMinDateObj);
  const dobMaxDate = formatDateForInput(dobMaxDateObj);

  useEffect(() => {
    if (!editingUserId) {
      navigate('/admin/users', { replace: true });
    }
  }, [editingUserId, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadUserDetails = async () => {
      if (!editingUserId || !token) {
        return;
      }

      setIsLoadingUser(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          signOut();
          navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users/edit-staff-record' } } });
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load user details.');
        }

        const list = Array.isArray(data?.data) ? data.data : [];
        const matched = list.find((item) => item.id === editingUserId);

        if (!matched) {
          throw new Error('Selected user could not be found.');
        }

        if (isMounted) {
          setDbUser(matched);
          setFormData((prev) => ({
            ...prev,
            name: matched.name || '',
            personalEmail: matched.personalEmail || matched.email || '',
            gender: matched.gender || '',
            dateOfBirth: toDisplayDateFromIso(matched.dateOfBirth || ''),
            dateOfJoining: toDisplayDateFromIso(matched.dateOfJoining || ''),
            role: matched.role || prev.role,
          }));
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || 'Failed to load user details.');
          navigate('/admin/users', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    };

    void loadUserDetails();

    return () => {
      isMounted = false;
    };
  }, [editingUserId, navigate, signOut, toast, token]);

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/roles`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          signOut();
          navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users/edit-staff-record' } } });
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load roles.');
        }

        if (isMounted) {
          const nextRoles = Array.isArray(data?.data) ? data.data : [];
          setRoleOptions(nextRoles);
          setFormData((prev) => {
            if (nextRoles.some((role) => role.value === prev.role)) {
              return prev;
            }
            return { ...prev, role: nextRoles[0]?.value || prev.role };
          });
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || 'Failed to load roles.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoles(false);
        }
      }
    };

    if (token) {
      void loadRoles();
    }

    return () => {
      isMounted = false;
    };
  }, [navigate, signOut, toast, token]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateFullName(value);
      case 'personalEmail':
        return validateEmail(value);
      case 'gender':
        return validateRequired(value, 'Gender');
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
      case 'role':
        return validateRequired(value, 'Assigned Role');
      default:
        return '';
    }
  };

  const fieldClass = (name) => {
    const hasError = fieldErrors[name]?.length > 0;
    return `block w-full rounded-md border bg-white py-2 px-3 text-sm text-slate-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200 ${
      hasError
        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/20'
        : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10'
    }`;
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!(name in fieldErrors)) return;
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error ? [error] : [] }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }

    let nextValue = type === 'checkbox' ? checked : value;
    if (name === 'dateOfBirth' || name === 'dateOfJoining') {
      nextValue = formatDateInputTyping(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingUserId || !dbUser?.id) return;

    const fields = ['name', 'personalEmail', 'gender', 'dateOfBirth', 'dateOfJoining', 'role'];
    const nextErrors = {
      name: [],
      personalEmail: [],
      gender: [],
      dateOfBirth: [],
      dateOfJoining: [],
      role: [],
    };

    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) nextErrors[field] = [error];
    });

    setFieldErrors(nextErrors);
    setErrorMessage('');

    const hasErrors = Object.values(nextErrors).some((list) => list.length > 0);
    if (hasErrors) {
      return;
    }

    const payload = {};
    const nextName = formData.name.trim();
    const nextPersonalEmail = formData.personalEmail.trim();
    const nextDateOfBirth = toIsoDateFromDisplay(formData.dateOfBirth);
    const nextDateOfJoining = toIsoDateFromDisplay(formData.dateOfJoining);

    const currentDateOfBirth = String(dbUser.dateOfBirth || '').slice(0, 10);
    const currentDateOfJoining = String(dbUser.dateOfJoining || '').slice(0, 10);

    if (nextName !== (dbUser.name || '')) payload.name = nextName;
    if (nextPersonalEmail !== (dbUser.personalEmail || dbUser.email || '')) payload.personalEmail = nextPersonalEmail;
    if (formData.gender !== (dbUser.gender || '')) payload.gender = formData.gender;
    if (nextDateOfBirth !== currentDateOfBirth) payload.dateOfBirth = nextDateOfBirth;
    if (nextDateOfJoining !== currentDateOfJoining) payload.dateOfJoining = nextDateOfJoining;
    if (formData.role !== (dbUser.role || '')) payload.role = formData.role;
    if (Object.keys(payload).length === 0) {
      setErrorMessage('Make at least one change before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${dbUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        signOut();
        navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/users/edit-staff-record' } } });
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update user.');
      }

      navigate('/admin/users', {
        replace: true,
        state: { message: data?.message || 'Staff record updated successfully' },
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update user.');
      toast.error(error.message || 'Failed to update user.');
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
              <UserCheck size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 tracking-tight">Edit Staff Details</h2>
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
        aria-label="Edit staff member form"
      >
        {isLoadingUser ? (
          <p className="text-sm text-slate-600 animate-pulse">Loading staff details...</p>
        ) : null}
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
              {fieldErrors.name.length > 0 ? (
                <p className="mt-1 text-xs text-red-700" role="alert">{fieldErrors.name[0]}</p>
              ) : null}
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
              {fieldErrors.personalEmail.length > 0 ? (
                <p className="mt-1 text-xs text-red-700" role="alert">{fieldErrors.personalEmail[0]}</p>
              ) : null}
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
              {fieldErrors.gender.length > 0 ? (
                <p className="mt-1 text-xs text-red-700" role="alert">{fieldErrors.gender[0]}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dateOfBirth" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                <CalendarDays className="h-3.5 w-3.5 text-teal-600/70" />
                Date of Birth
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
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
                    if (fieldErrors.dateOfBirth.length > 0) {
                      setFieldErrors((prev) => ({ ...prev, dateOfBirth: [] }));
                    }
                  }}
                />
                <CalendarDays className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.dateOfBirth.length > 0 ? (
                <p className="mt-1 text-xs text-red-700" role="alert">{fieldErrors.dateOfBirth[0]}</p>
              ) : null}
            </div>
          </div>
        </div>

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
                    if (fieldErrors.dateOfJoining.length > 0) {
                      setFieldErrors((prev) => ({ ...prev, dateOfJoining: [] }));
                    }
                  }}
                />
                <CalendarCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.dateOfJoining.length > 0 ? (
                <p className="mt-1 text-xs text-red-700" role="alert">{fieldErrors.dateOfJoining[0]}</p>
              ) : null}
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
                  {(roleOptions.length > 0 ? roleOptions : ROLE_OPTIONS).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {fieldErrors.role.length > 0 ? (
                <p className="mt-1 text-xs text-red-700" role="alert">{fieldErrors.role[0]}</p>
              ) : null}
            </div>

          </div>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 font-medium" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 sm:flex-none px-8"
          >
            {isSubmitting ? 'Processing...' : 'Update Staff'}
          </button>
        </div>
      </form>
    </div>
  );
}
