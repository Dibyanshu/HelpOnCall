function readErrorMessage(errorBody) {
  if (errorBody && typeof errorBody === 'object' && 'message' in errorBody) {
    const message = errorBody.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return 'Unable to submit your application right now.';
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