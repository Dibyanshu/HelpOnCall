import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FolderTree, PlusCircle, RefreshCcw, Settings2, Trash2, Wrench, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext.jsx';
import { useServiceManagement } from '../../appServices/useServiceManagement.js';
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
  const [mode, setMode] = useState('create-category');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

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
    setErrorMessage,
    setSuccessMessage,
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

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) || null,
    [services, selectedServiceId],
  );

  const startCreateCategory = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setMode('create-category');
    setSelectedCategoryId(null);
    setSelectedServiceId(null);
  };

  const startCreateService = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setMode('create-service');
    setSelectedServiceId(null);
  };

  const startEditCategory = (categoryId) => {
    setErrorMessage('');
    setSuccessMessage('');
    setMode('edit-category');
    setSelectedCategoryId(categoryId);
    setSelectedServiceId(null);
  };

  const startEditService = (serviceId) => {
    setErrorMessage('');
    setSuccessMessage('');
    setMode('edit-service');
    setSelectedServiceId(serviceId);
  };

  const handleCategorySubmit = async (payload) => {
    if (mode === 'edit-category' && selectedCategoryId) {
      const result = await updateCategory(selectedCategoryId, payload);
      if (!result.ok) {
        throw new Error(result.message || 'Failed to update category.');
      }
      return;
    }

    const result = await createCategory(payload);

    if (!result.ok) {
      throw new Error(result.message || 'Failed to create category.');
    }
  };

  const handleServiceSubmit = async (payload) => {
    if (mode === 'edit-service' && selectedServiceId) {
      const result = await updateService(selectedServiceId, payload);
      if (!result.ok) {
        throw new Error(result.message || 'Failed to update service.');
      }
      return;
    }

    const result = await createService(payload);

    if (!result.ok) {
      throw new Error(result.message || 'Failed to create service.');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategoryId) {
      return;
    }

    const result = await deleteCategory(selectedCategoryId);

    if (!result.ok) {
      setErrorMessage(result.message || 'Failed to delete category.');
      return;
    }

    setSelectedCategoryId(null);
    setSelectedServiceId(null);
    setMode('create-category');
  };

  const handleDeleteService = async () => {
    if (!selectedServiceId) {
      return;
    }

    const result = await deleteService(selectedServiceId);

    if (!result.ok) {
      setErrorMessage(result.message || 'Failed to delete service.');
      return;
    }

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

    setErrorMessage('');
    setSuccessMessage('');

    const currentOrder = currentService.displayOrder ?? 0;
    const targetOrder = targetService.displayOrder ?? 0;

    const moveResult = await updateService(currentService.id, { displayOrder: targetOrder });

    if (!moveResult.ok) {
      setErrorMessage(moveResult.message || 'Failed to reorder service.');
      return;
    }

    const swapResult = await updateService(targetService.id, { displayOrder: currentOrder });

    if (!swapResult.ok) {
      setErrorMessage(swapResult.message || 'Failed to reorder service.');
    }
  };

  const handleMoveCategory = async (categoriesList, currentIndex, direction) => {
    const currentCategory = categoriesList[currentIndex];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCategory = categoriesList[targetIndex];

    if (!currentCategory || !targetCategory || isSaving) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const currentOrder = currentCategory.displayOrder ?? 0;
    const targetOrder = targetCategory.displayOrder ?? 0;

    const moveResult = await updateCategory(currentCategory.id, { displayOrder: targetOrder });

    if (!moveResult.ok) {
      setErrorMessage(moveResult.message || 'Failed to reorder category.');
      return;
    }

    const swapResult = await updateCategory(targetCategory.id, { displayOrder: currentOrder });

    if (!swapResult.ok) {
      setErrorMessage(swapResult.message || 'Failed to reorder category.');
    }
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
              <p className="text-sm text-slate-500 font-sans">
                Signed in as <span className="font-semibold text-teal-700">{user?.name || user?.email}</span> ({user?.role})
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
            <button
              type="button"
              onClick={refresh}
              className="btn-secondary gap-2 px-6 transition-all"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid max-w-full gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="mt-2 flex items-center gap-2 text-xl font-bold text-slate-900">
                <FolderTree className="h-5 w-5 text-teal-700" />
                Services Tree
              </h1>
            </div>
          </div>



          <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-sm text-slate-600">Loading categories and services...</p>
            ) : null}

            {!isLoading && serviceTree.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                No categories or services found.
              </p>
            ) : null}

            {!isLoading
              ? serviceTree.map((category, categoryIndex) => (
                <div key={category.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditCategory(category.id)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                    >
                      <span className="truncate text-sm font-semibold text-slate-900">{category.title}</span>
                      {/* <span className="text-[11px] text-slate-500">#{toDisplayNumber(category.displayOrder ?? 0)}</span> */}
                    </button>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void handleMoveCategory(serviceTree, categoryIndex, 'up');
                        }}
                        disabled={isSaving || categoryIndex === 0}
                        className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move ${category.title} up`}
                        title="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void handleMoveCategory(serviceTree, categoryIndex, 'down');
                        }}
                        disabled={isSaving || categoryIndex === serviceTree.length - 1}
                        className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Move ${category.title} down`}
                        title="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1 border-l border-slate-200">
                    {category.services.length > 0 ? (
                      category.services.map((service, serviceIndex) => (
                        <div
                          key={service.id}
                          className="flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-xs text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <button
                            type="button"
                            onClick={() => startEditService(service.id)}
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left"
                          >
                            {/* <span className="font-bold text-slate-400">{toDisplayNumber(service.displayOrder ?? 0)}.</span> */}
                            <span className="truncate">{service.label}</span>
                          </button>

                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void handleMoveService(category.services, serviceIndex, 'up');
                              }}
                              disabled={isSaving || serviceIndex === 0}
                              className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Move ${service.label} up`}
                              title="Move up"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void handleMoveService(category.services, serviceIndex, 'down');
                              }}
                              disabled={isSaving || serviceIndex === category.services.length - 1}
                              className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Move ${service.label} down`}
                              title="Move down"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No services in this category.</p>
                    )}
                  </div>
                </div>
              ))
              : null}
          </div>
        </aside>

        <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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

          {errorMessage ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              {successMessage}
            </p>
          ) : null}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-6">
            {mode === 'create-category' || mode === 'edit-category' ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Settings2 className="h-4 w-4 text-teal-700" />
                    Category Details
                  </div>
                  {selectedCategory && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
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
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
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
