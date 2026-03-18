import { useCallback, useMemo, useState } from 'react';
import { FolderTree, PlusCircle, RefreshCcw, Settings2, Trash2, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../auth/AdminAuthContext.jsx';
import { useServiceManagement } from '../../hooks/useServiceManagement.js';
import CategoryForm from './CategoryForm.jsx';
import ServiceForm from './ServiceForm.jsx';

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

export default function ServiceDashboardLayout() {
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Admin Portal</p>
              <h1 className="mt-2 flex items-center gap-2 text-xl font-bold text-slate-900">
                <FolderTree className="h-5 w-5 text-teal-700" />
                Services Tree
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Signed in as {user?.name || user?.email} ({user?.role})
              </p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="rounded-md border border-slate-300 p-2 text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="Refresh service data"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startCreateCategory}
              className="btn-primary"
            >
              <PlusCircle className="h-4 w-4" />
              Add Category
            </button>
            <button
              type="button"
              onClick={startCreateService}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <PlusCircle className="h-4 w-4" />
              Add Service
            </button>
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
              ? serviceTree.map((category) => (
                  <div key={category.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <button
                      type="button"
                      onClick={() => startEditCategory(category.id)}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900">{category.title}</span>
                      <span className="text-[11px] text-slate-500">#{category.displayOrder ?? 0}</span>
                    </button>

                    <div className="mt-2 space-y-1 border-l border-slate-200 pl-3">
                      {category.services.length > 0 ? (
                        category.services.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => startEditService(service.id)}
                            className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100"
                          >
                            {service.label}
                          </button>
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
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Settings2 className="h-4 w-4 text-teal-700" />
                  Category Details
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
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Wrench className="h-4 w-4 text-teal-700" />
                  Service Details
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
