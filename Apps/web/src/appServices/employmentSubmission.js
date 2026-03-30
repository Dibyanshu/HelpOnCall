function readErrorMessage(errorBody) {
  if (errorBody && typeof errorBody === 'object' && 'message' in errorBody) {
    const message = errorBody.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return 'Unable to submit your application right now.';
}

function normalizeServiceGroups(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((group) => {
      if (!group || typeof group !== 'object') {
        return null;
      }

      const options = Array.isArray(group.features)
        ? group.features
            .map((feature) => {
              if (!feature || typeof feature !== 'object') {
                return null;
              }

              const categoryId = Number(feature.categoryId);
              const serviceId = Number(feature.serviceId);
              const label = typeof feature.label === 'string' ? feature.label : '';

              if (!Number.isInteger(categoryId) || categoryId <= 0) {
                return null;
              }

              if (!Number.isInteger(serviceId) || serviceId <= 0) {
                return null;
              }

              if (!label) {
                return null;
              }

              return {
                label,
                categoryId,
                serviceId,
                icon: typeof feature.icon === 'string' ? feature.icon : null,
              };
            })
            .filter(Boolean)
        : [];

      const groupLabel = typeof group.title === 'string' ? group.title : '';

      if (!groupLabel || options.length === 0) {
        return null;
      }

      return {
        label: groupLabel,
        options,
      };
    })
    .filter(Boolean);
}

async function getJson(path) {
  const response = await fetch(path, { method: 'GET' });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(readErrorMessage(data));
  }

  return data;
}

export async function fetchEmploymentSpecializationGroups(apiBaseUrl) {
  const data = await getJson(`${apiBaseUrl}/api/v1/services`);
  return normalizeServiceGroups(data);
}

export async function postEmploymentApplication(apiBaseUrl, formData) {
  const response = await fetch(`${apiBaseUrl}/api/v1/employment`, {
    method: 'POST',
    body: buildEmploymentPayload(formData),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(readErrorMessage(errorBody));
  }

  return response.json().catch(() => ({}));
}

export function buildEmploymentPayload(formData) {
  const payload = new FormData();

  payload.append('fullName', formData.fullName.trim());
  payload.append('emailAddress', formData.email.trim());
  payload.append('phoneNumber', formData.phone.trim());
  payload.append('coverLetter', formData.coverLetter.trim());
  payload.append('specializations', JSON.stringify(formData.specializations));
  payload.append('resume', formData.resume);

  return payload;
}

export async function submitEmploymentApplication({ apiBaseUrl, formData }) {
  return postEmploymentApplication(apiBaseUrl, formData);
}