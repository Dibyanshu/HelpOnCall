import { useCallback, useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, FolderTree, PlusCircle, RefreshCcw, Settings2, Trash2, Wrench, Database, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import { useServiceManagement } from '../../appServices/useServiceManagement.js';
import { useToast } from '../../components/common/Toast.jsx';
import { useConfirm } from '../../components/common/ConfirmDialog.jsx';
import CategoryForm from './services/CategoryForm.jsx';
import ServiceForm from './services/ServiceForm.jsx';

function buildFormModeTitle(mode) {
  if (mode === 'create-category') {
    return 'Create Category';
  }

  if (mode === 'edit-category') {
    return 'Edit Category';
  }

  if (mode === 'create-service') {
    return 'Create Service';
  }

  if (mode === 'edit-service') {
    return 'Edit Service';
  }

  return 'Service Manager';
}

// This method increases the service category indexing value by 1 just for better end-user visibility
function toDisplayNumber(order) {
  return order;
}

export default function AdminServicePage() {
  const [mode, setMode] = useState('create-service');
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const navigate = useNavigate();
  const { token, user, signOut } = useAdminAuth();

  const handleUnauthorized = useCallback(() => {
    signOut();
    navigate('/admin/login', { replace: true, state: { from: { pathname: '/admin/services' } } });
  }, [navigate, signOut]);

  const {
    categories,
    services,
    serviceTree,
    categoriesForDropdown,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
    createService,
    updateService,
    deleteService,
  } = useServiceManagement({
    token,
    onUnauthorized: handleUnauthorized,
  });

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage, toast]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage, toast]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) || null,
    [services, selectedServiceId],
  );

  const startCreateCategory = () => {
    setMode('create-category');
    setSelectedCategoryId(null);
    setSelectedServiceId(null);
  };

  const startCreateService = () => {
    setMode('create-service');
    setSelectedServiceId(null);
  };

  const startEditCategory = (categoryId) => {
    setMode('edit-category');
    setSelectedCategoryId(categoryId);
    setSelectedServiceId(null);
  };

  const startEditService = (serviceId) => {
    setMode('edit-service');
    setSelectedServiceId(serviceId);
  };

  const handleCategorySubmit = async (payload) => {
    if (mode === 'edit-category' && selectedCategoryId) {
      const result = await updateCategory(selectedCategoryId, payload);
      if (!result.ok) {
        throw new Error(result.message || 'Failed to update category.');
      }
      setHasChanges(true);
      return;
    }

    const result = await createCategory(payload);

    if (!result.ok) {
      throw new Error(result.message || 'Failed to create category.');
    }
    setHasChanges(true);
  };

  const handleServiceSubmit = async (payload) => {
    if (mode === 'edit-service' && selectedServiceId) {
      const result = await updateService(selectedServiceId, payload);
      if (!result.ok) {
        throw new Error(result.message || 'Failed to update service.');
      }
      setHasChanges(true);
      return;
    }

    const result = await createService(payload);

    if (!result.ok) {
      throw new Error(result.message || 'Failed to create service.');
    }
    setHasChanges(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId || !selectedCategory) {
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Category?',
      message: `Are you sure you want to delete "${selectedCategory.title}"? This will also affect any associated services.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Stay Safe',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    const result = await deleteCategory(selectedCategoryId);

    if (!result.ok) {
      return;
    }

    setHasChanges(true);
    setSelectedCategoryId(null);
    setSelectedServiceId(null);
    setMode('create-category');
  };

  const handleDeleteService = async () => {
    if (!selectedServiceId || !selectedService) {
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Service?',
      message: `Are you sure you want to remove "${selectedService.label}"? This action cannot be reversed.`,
      confirmText: 'Remove Service',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    const result = await deleteService(selectedServiceId);

    if (!result.ok) {
      return;
    }

    setHasChanges(true);
    setSelectedServiceId(null);
    setMode('create-service');
  };

  const handleMoveService = async (categoryServices, currentIndex, direction) => {
    const currentService = categoryServices[currentIndex];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetService = categoryServices[targetIndex];

    if (!currentService || !targetService || isSaving) {
      return;
    }

    const currentOrder = currentService.displayOrder ?? 0;
    const targetOrder = targetService.displayOrder ?? 0;

    const moveResult = await updateService(currentService.id, { displayOrder: targetOrder });

    if (!moveResult.ok) {
      return;
    }

    await updateService(targetService.id, { displayOrder: currentOrder });
    setHasChanges(true);
  };

  const handleMoveCategory = async (categoriesList, currentIndex, direction) => {
    const currentCategory = categoriesList[currentIndex];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCategory = categoriesList[targetIndex];

    if (!currentCategory || !targetCategory || isSaving) {
      return;
    }

    const currentOrder = currentCategory.displayOrder ?? 0;
    const targetOrder = targetCategory.displayOrder ?? 0;

    const moveResult = await updateCategory(currentCategory.id, { displayOrder: targetOrder });

    if (!moveResult.ok) {
      return;
    }

    await updateCategory(targetCategory.id, { displayOrder: currentOrder });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-md border border-slate-200 bg-white p-6 shadow-md sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-teal-50 flex items-center justify-center text-teal-700">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Service Manager Dashboard</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={!hasChanges}
              onClick={() => {
                const newWindow = window.open('/services', '_blank');
                if (newWindow) {
                  setHasChanges(false);
                  window.location.reload();
                } else {
                  toast.error('Please allow popups to open the services page.');
                }
              }}
              className={`${hasChanges ? 'btn-primary bg-indigo-600 hover:bg-indigo-700 hover:scale-105' : 'btn-secondary opacity-50 cursor-not-allowed border-slate-200 text-slate-400'} gap-2 px-6 transition-all`}
            >
              <ExternalLink size={16} />
              Preview Changes
            </button>
            <button
              type="button"
              onClick={refresh}
              className="btn-secondary gap-2 px-6 transition-all"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={startCreateCategory}
              className={`${mode === 'create-category' || mode === 'edit-category' ? 'btn-primary' : 'btn-secondary'} gap-2 px-6 transition-all`}
            >
              <PlusCircle size={16} />
              Add Category
            </button>
            <button
              type="button"
              onClick={startCreateService}
              className={`${mode === 'create-service' || mode === 'edit-service' ? 'btn-primary' : 'btn-secondary'} gap-2 px-6 transition-all`}
            >
              <PlusCircle size={16} />
              Add Service
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid max-w-full gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left container forced to grid row height via lg:h-0 lg:min-h-full trick */}
        <div className="lg:h-0 lg:min-h-full flex flex-col">
          <aside className="relative flex min-h-[400px] flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:min-h-0 lg:flex-1">
            <div className="flex shrink-0 items-start justify-between gap-3">
              <div>
                <h1 className="mt-2 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <FolderTree className="h-5 w-5 text-teal-700" />
                  Services Tree
                </h1>
              </div>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto pr-2 pb-2">
              {isLoading ? (
                <p className="text-sm text-slate-600">Loading categories and services...</p>
              ) : null}

              {!isLoading && serviceTree.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                  No categories or services found.
                </p>
              ) : null}

              {!isLoading
                ? serviceTree.map((category, categoryIndex) => {
                  const isExpanded = expandedCategories[category.id] ?? false;
                  return (
                    <div key={category.id} className="mb-1">
                      <div className={`group flex items-center justify-between gap-2 rounded-md px-2 py-2 transition-colors ${selectedCategoryId === category.id && mode === 'edit-category' ? 'bg-teal-50 text-teal-900 border border-teal-100' : 'hover:bg-slate-50 text-slate-700 border border-transparent'}`}>
                        <div className="flex flex-1 items-center gap-1.5 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(category.id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-200 cursor-pointer"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditCategory(category.id)}
                            className="truncate text-sm font-semibold flex-1 text-left cursor-pointer"
                          >
                            {category.title}
                          </button>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void handleMoveCategory(serviceTree, categoryIndex, 'up');
                            }}
                            disabled={isSaving || categoryIndex === 0}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void handleMoveCategory(serviceTree, categoryIndex, 'down');
                            }}
                            disabled={isSaving || categoryIndex === serviceTree.length - 1}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="ml-5 mt-1 space-y-1 border-l-2 border-slate-100 pl-3 pt-1 pb-2">
                          {category.services.length > 0 ? (
                            category.services.map((service, serviceIndex) => {
                              const isCustomSelected = selectedServiceId === service.id && mode === 'edit-service';
                              return (
                                <div
                                  key={service.id}
                                  className={`group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors ${isCustomSelected ? 'bg-teal-50 text-teal-800 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => startEditService(service.id)}
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs cursor-pointer"
                                  >
                                    <span className="truncate">{service.label}</span>
                                  </button>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        void handleMoveService(category.services, serviceIndex, 'up');
                                      }}
                                      disabled={isSaving || serviceIndex === 0}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 shadow-sm hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
                                      title="Move Up"
                                    >
                                      <ChevronUp size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        void handleMoveService(category.services, serviceIndex, 'down');
                                      }}
                                      disabled={isSaving || serviceIndex === category.services.length - 1}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 shadow-sm hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
                                      title="Move Down"
                                    >
                                      <ChevronDown size={12} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <p className="px-2 py-1 text-xs text-slate-400 italic">No services available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
                : null}
            </div>
          </aside>
        </div>

        {/* Right card which defines the intrinsic content height of the grid row */}
        <main className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{buildFormModeTitle(mode)}</h2>
            <div className="flex flex-wrap gap-2">
              {(mode === 'edit-category' && selectedCategory) ? (
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Category
                </button>
              ) : null}

              {(mode === 'edit-service' && selectedService) ? (
                <button
                  type="button"
                  onClick={handleDeleteService}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Service
                </button>
              ) : null}
            </div>
          </div>



          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
            {mode === 'create-category' || mode === 'edit-category' ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Settings2 className="h-4 w-4 text-teal-700" />
                    Category Details
                  </div>
                  {selectedCategory && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
                      #{toDisplayNumber(selectedCategory.displayOrder ?? 0)}
                    </span>
                  )}
                </div>
                <CategoryForm
                  key={`category-${selectedCategory?.id || 'new'}`}
                  initialData={selectedCategory}
                  onSubmit={handleCategorySubmit}
                />
              </>
            ) : null}

            {mode === 'create-service' || mode === 'edit-service' ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Wrench className="h-4 w-4 text-teal-700" />
                    Service Details
                  </div>
                  {selectedService && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
                      #{toDisplayNumber(selectedService.displayOrder ?? 0)}
                    </span>
                  )}
                </div>
                <ServiceForm
                  key={`service-${selectedService?.id || 'new'}`}
                  initialData={selectedService}
                  categories={categoriesForDropdown}
                  onSubmit={handleServiceSubmit}
                />
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
