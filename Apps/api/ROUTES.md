# HelpOnCall API Routes

This file contains copyable endpoint definitions for Postman.

## Base Settings

- Base URL: `http://localhost:3000`
- API Prefix: `/api/v1`

Use this variable in Postman:

- `baseUrl` = `http://localhost:3000`

Optional variables:

- `accessToken` = paste JWT from login response

---

## 1) Health Check

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/health`
- Auth: None

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/health'
```

### Success Response (200)

```json
{
  "status": "ok"
}
```

---

## 1.1) Mail Health Check

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/health/mail`
- Auth: None

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/health/mail'
```

### Success Response (200)

```json
{
  "status": "ok",
  "smtp": "reachable",
  "latencyMs": 123
}
```

### Failure Response (503)

```json
{
  "status": "error",
  "smtp": "unreachable",
  "latencyMs": 1250
}
```

When `MAIL_ENABLED=false`:

```json
{
  "status": "mail_disabled"
}
```

---

## 2) Admin Login

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/auth/admin/login`
- Auth: None
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "email": "superadmin_dibby@yopmail.com",
  "password": "rootDibby@123"
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/auth/admin/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "superadmin_dibby@yopmail.com",
  "password": "rootDibby@123"
}'
```

### Success Response (200)

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "superadmin_dibby@yopmail.com",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

### Postman Test Script (Optional)

Use this in the Tests tab to auto-save token:

```javascript
const res = pm.response.json();
if (res.token) {
  pm.environment.set("accessToken", res.token);
}
```

---

## 3) Public User Registration

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/auth/register`
- Auth: None
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "email": "newuser@helponcall.local",
  "name": "New User",
  "password": "UserPass123!",
  "role": "content_publisher"
}
```

Allowed role values:

- `content_publisher`
- `resume_reviewer`
- `job_poster`

Note:

- New registrations are always saved as inactive (`isActive: false`) and require admin activation.
- If SMTP is enabled, a registration acknowledgement email is sent to the user.

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "newuser@helponcall.local",
  "name": "New User",
  "password": "UserPass123!",
  "role": "content_publisher"
}'
```

### Success Response (201)

```json
{
  "message": "Registration submitted successfully. Your account will be activated by an admin.",
  "user": {
    "id": 5,
    "email": "newuser@helponcall.local",
    "name": "New User",
    "role": "content_publisher",
    "isActive": false,
    "createdAt": "2026-03-14T10:00:00.000Z"
  }
}
```

---

## 4) Change Password

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/auth/change-password`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "currentPassword": "rootDibby@123",
  "newPassword": "NewStrongPassword123!"
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/auth/change-password' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "currentPassword": "rootDibby@123",
  "newPassword": "NewStrongPassword123!"
}'
```

### Success Response (200)

```json
{
  "message": "Password updated successfully"
}
```

---

## 4.1) Submit Employment Application

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/employment`
- Auth: None
- Header: `Content-Type: multipart/form-data`

Form-data fields:

- `fullName`: text
- `emailAddress`: text
- `phoneNumber`: text
- `specializations`: JSON string (e.g. `[{"categoryId":1,"serviceId":2}]`)
- `coverLetter`: text
- `resume`: file (`.pdf`, `.doc`, `.docx`)

Notes:

- Resume is uploaded through multipart field `resume` and stored on the server with `GUID + extension`.
- Allowed resume extensions: `.pdf`, `.doc`, `.docx`.
- `specializations` also accepts an array of strings for backward compatibility.

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/employment' \
--form 'fullName="Jane Doe"' \
--form 'emailAddress="jane@example.com"' \
--form 'phoneNumber="+1 (647) 123-4567"' \
--form 'specializations="[{""categoryId"":1,""serviceId"":2}]"' \
--form 'coverLetter="I have 6 years of caregiving experience."' \
--form 'resume=@"/path/to/jane-doe-resume.pdf"'
```

### Success Response (201)

```json
{
  "message": "Employment application submitted successfully",
  "submission": {
    "id": 1,
    "empId": "8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1",
    "status": "new",
    "resumeFileName": "f5a0dd9a-b1bf-44f2-a9d2-f6b3196280a8.pdf",
    "createdAt": "2026-03-18T12:00:00.000Z"
  }
}
```

---

## 4.2) Approve Employment Submission (Admin / Super Admin)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/employment/:empId/approve`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location --request POST '{{baseUrl}}/api/v1/admin/employment/8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1/approve' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "message": "Employment submission approved successfully",
  "submission": {
    "id": 1,
    "empId": "8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1",
    "status": "approve",
    "updatedAt": "2026-03-18T12:15:00.000Z"
  }
}
```

---

## 4.3) Reject Employment Submission (Admin / Super Admin)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/employment/:empId/reject`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location --request POST '{{baseUrl}}/api/v1/admin/employment/8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1/reject' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "message": "Employment submission rejected successfully",
  "submission": {
    "id": 1,
    "empId": "8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1",
    "status": "reject",
    "updatedAt": "2026-03-18T12:16:00.000Z"
  }
}
```

---

## 4.4) List/Search Employment Submissions (Admin / Super Admin)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/employment?search=jane&status=new`
- Auth: Bearer Token -> `{{accessToken}}`

Query params:

- `search` (optional): matches `empId`, full name, email, phone.
- `status` (optional): `new`, `approve`, `reject`.

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/employment?search=jane&status=new' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "empId": "8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1",
      "fullName": "Jane Doe",
      "emailAddress": "jane@example.com",
      "phoneNumber": "+1 (647) 123-4567",
      "specializations": "[{\"categoryId\":1,\"serviceId\":2}]",
      "coverLetter": "I have 6 years of caregiving experience.",
      "resumeFileName": "f5a0dd9a-b1bf-44f2-a9d2-f6b3196280a8.pdf",
      "status": "new",
      "createdBy": "public_employment_form",
      "createdAt": "2026-03-18T12:00:00.000Z",
      "updatedAt": "2026-03-18T12:00:00.000Z"
    }
  ]
}
```

---

## 4.5) Download Employment Resume (Admin / Super Admin)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/employment/:empId/resume`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/employment/8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1/resume' \
--header 'Authorization: Bearer {{accessToken}}' \
--output employment-resume.pdf
```

### Success Response (200)

- Binary file stream (`application/pdf`, `application/msword`, or docx MIME type)
- `Content-Disposition: attachment; filename="employment-<empId>.<ext>"`

---

## 4.6) Request Email Verification Code (Public)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/email-validator/request-code`
- Auth: None
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "email": "candidate@example.com",
  "module": "employee",
  "data": {
    "fullName": "Jane Doe",
    "phone": "+1 647-000-0000"
  }
}
```

Allowed module values:

- `employee`
- `user_registration`
- `rfq`

Validation note:

- For `employee` module, if the email already exists in employment submissions, API returns `400` with message `Employment application already exists for this email`.

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/email-validator/request-code' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "candidate@example.com",
  "module": "employee",
  "data": { "fullName": "Jane Doe", "phone": "+1 647-000-0000" }
}'
```

### Success Response (201)

```json
{
  "message": "Verification code sent successfully",
  "data": {
    "email": "candidate@example.com",
    "module": "employee",
    "expiresInSeconds": 900
  }
}
```

---

## 4.7) Verify Email Verification Code (Public)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/email-validator/verify-code`
- Auth: None
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "email": "candidate@example.com",
  "module": "employee",
  "code": "a6f90e33-81f0-4d3f-a27d-cf61ff13df53"
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/email-validator/verify-code' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "candidate@example.com",
  "module": "employee",
  "code": "a6f90e33-81f0-4d3f-a27d-cf61ff13df53"
}'
```

### Success Response (200)

```json
{
  "message": "Email verified successfully",
  "data": {
    "email": "candidate@example.com",
    "module": "employee",
    "verified": true,
    "payload": {
      "fullName": "Jane Doe",
      "phone": "+1 647-000-0000"
    }
  }
}
```

---

## 5) Create User (Super Admin)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/users`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "email": "publisher@helponcall.local",
  "name": "Content Publisher User",
  "password": "UserPass123!",
  "role": "content_publisher",
  "isActive": true
}
```

Allowed role values:

- `content_publisher`
- `resume_reviewer`
- `job_poster`
- `super_admin`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/users' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "publisher@helponcall.local",
  "name": "Content Publisher User",
  "password": "UserPass123!",
  "role": "content_publisher",
  "isActive": true
}'
```

### Success Response (201)

```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "publisher@helponcall.local",
    "name": "Content Publisher User",
    "role": "content_publisher",
    "isActive": true,
    "createdAt": "2026-03-12T10:00:00.000Z"
  }
}
```

---

## 6) List Users (Super Admin)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/users`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/users' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": 2,
      "email": "publisher@helponcall.local",
      "name": "Content Publisher User",
      "role": "content_publisher",
      "isActive": true,
      "createdAt": "2026-03-12T10:00:00.000Z",
      "updatedAt": "2026-03-12T10:00:00.000Z"
    }
  ]
}
```

---

## 6.1) List Roles (Super Admin)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/roles`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/roles' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": [
    {
      "value": "content_publisher",
      "label": "Content Publisher"
    },
    {
      "value": "resume_reviewer",
      "label": "Resume Reviewer"
    },
    {
      "value": "job_poster",
      "label": "Job Poster"
    },
    {
      "value": "admin",
      "label": "Admin"
    },
    {
      "value": "super_admin",
      "label": "Super Admin"
    }
  ]
}
```

---

## 7) Update User Status (Super Admin)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/users/status`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "userId": 2,
  "isActive": false
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/users/status' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "userId": 2,
  "isActive": false
}'
```

### Success Response (200)

```json
{
  "message": "User status updated successfully",
  "user": {
    "id": 2,
    "email": "publisher@helponcall.local",
    "name": "Content Publisher User",
    "role": "content_publisher",
    "createdBy": "super_admin",
    "isActive": false,
    "createdAt": "2026-03-12T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:00:00.000Z"
  }
}
```

---

## 8) Edit User (Admin or Super Admin)

### Request

- Method: `PATCH` or `PUT`
- URL: `{{baseUrl}}/api/v1/admin/users/2`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON, any editable fields):

```json
{
  "name": "Updated User Name",
  "role": "job_poster",
  "isActive": true
}
```

### cURL

```bash
curl --location --request PATCH '{{baseUrl}}/api/v1/admin/users/2' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Updated User Name",
  "role": "job_poster",
  "isActive": true
}'
```

### Success Response (200)

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 2,
    "email": "publisher@helponcall.local",
    "name": "Updated User Name",
    "role": "job_poster",
    "createdBy": "super_admin",
    "isActive": true,
    "createdAt": "2026-03-12T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:10:00.000Z"
  }
}
```

Notes:

- Allowed roles to call this endpoint: `admin`, `super_admin`
- At least one field is required in request body
- Admin cannot edit `super_admin` users or assign `super_admin` role

---

## 8.1) Email Validator CRUD (Admin / Super Admin)

### 8.1.1) List Email Validators

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/email-validators`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/email-validators' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "email": "candidate@example.com",
      "data": "{\"fullName\":\"Jane Doe\",\"phone\":\"+1 647-000-0000\"}",
      "code": "a6f90e33-81f0-4d3f-a27d-cf61ff13df53",
      "module": "employee",
      "createdBy": "admin",
      "createdAt": "2026-03-25T11:00:00.000Z",
      "updatedAt": "2026-03-25T11:00:00.000Z"
    }
  ]
}
```

---

### 8.1.2) Create Email Validator

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/email-validator`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "email": "candidate@example.com",
  "data": "{\"fullName\":\"Jane Doe\",\"phone\":\"+1 647-000-0000\"}",
  "module": "employee"
}
```

Allowed module values:

- `employee`
- `user_registration`
- `rfq`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/email-validator' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "candidate@example.com",
  "data": "{\"fullName\":\"Jane Doe\",\"phone\":\"+1 647-000-0000\"}",
  "module": "employee"
}'
```

### Success Response (201)

```json
{
  "message": "Email validator created successfully",
  "data": {
    "id": 1,
    "email": "candidate@example.com",
    "data": "{\"fullName\":\"Jane Doe\",\"phone\":\"+1 647-000-0000\"}",
    "code": "a6f90e33-81f0-4d3f-a27d-cf61ff13df53",
    "module": "employee",
    "createdBy": "admin",
    "createdAt": "2026-03-25T11:00:00.000Z",
    "updatedAt": "2026-03-25T11:00:00.000Z"
  }
}
```

---

### 8.1.3) Update Email Validator

### Request

- Method: `PATCH`
- URL: `{{baseUrl}}/api/v1/admin/email-validator/:id`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON, at least one field required):

```json
{
  "module": "user_registration"
}
```

### cURL

```bash
curl --location --request PATCH '{{baseUrl}}/api/v1/admin/email-validator/1' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "module": "user_registration"
}'
```

### Success Response (200)

```json
{
  "message": "Email validator updated successfully",
  "data": {
    "id": 1,
    "email": "candidate@example.com",
    "data": "{\"fullName\":\"Jane Doe\",\"phone\":\"+1 647-000-0000\"}",
    "code": "a6f90e33-81f0-4d3f-a27d-cf61ff13df53",
    "module": "user_registration",
    "createdBy": "admin",
    "createdAt": "2026-03-25T11:00:00.000Z",
    "updatedAt": "2026-03-25T11:10:00.000Z"
  }
}
```

---

### 8.1.4) Delete Email Validator

### Request

- Method: `DELETE`
- URL: `{{baseUrl}}/api/v1/admin/email-validator/:id`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location --request DELETE '{{baseUrl}}/api/v1/admin/email-validator/1' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "message": "Email validator deleted successfully",
  "data": {
    "id": 1,
    "email": "candidate@example.com",
    "data": "{\"fullName\":\"Jane Doe\",\"phone\":\"+1 647-000-0000\"}",
    "code": "a6f90e33-81f0-4d3f-a27d-cf61ff13df53",
    "module": "employee",
    "createdBy": "admin",
    "createdAt": "2026-03-25T11:00:00.000Z",
    "updatedAt": "2026-03-25T11:00:00.000Z"
  }
}
```

---

## 9) Services CRUD

<a id="services-list"></a>
### 9.1) List Services (Public)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/services`
- Auth: None

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/services'
```

### Success Response (200)

```json
[
  {
    "title": "Household Chores",
    "features": [
      {
        "label": "Moderate Housekeeping",
        "desc": "Light home making like Organizing closets & cabinets etc., Preparing & folding laundry, In-house dusting & cleaning, Taking out garbage, Bed making",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "icon": "Home"
      }
    ]
  }
]
```

---

<a id="services-create-category"></a>
### 9.2) Create Service Category (Admin/Super Admin)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/service-categories`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "title": "Companion Care",
  "displayOrder": 3
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/service-categories' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "Companion Care",
  "displayOrder": 3
}'
```

### Success Response (201)

```json
{
  "message": "Service category created successfully",
  "category": {
    "id": 10,
    "title": "Companion Care",
    "displayOrder": 3,
    "createdBy": "admin",
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-03-15T10:00:00.000Z"
  }
}
```

---

<a id="services-update-category"></a>
### 9.3) Update Service Category (Admin/Super Admin)

### Request

- Method: `PATCH`
- URL: `{{baseUrl}}/api/v1/admin/service-categories/10`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON, any updatable fields):

```json
{
  "title": "Companion Support",
  "displayOrder": 2
}
```

### cURL

```bash
curl --location --request PATCH '{{baseUrl}}/api/v1/admin/service-categories/10' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "Companion Support",
  "displayOrder": 2
}'
```

### Success Response (200)

```json
{
  "message": "Service category updated successfully",
  "category": {
    "id": 10,
    "title": "Companion Support",
    "displayOrder": 2,
    "createdBy": "admin",
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-03-15T10:10:00.000Z"
  }
}
```

---

<a id="services-delete-category"></a>
### 9.4) Delete Service Category (Admin/Super Admin)

### Request

- Method: `DELETE`
- URL: `{{baseUrl}}/api/v1/admin/service-categories/10`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location --request DELETE '{{baseUrl}}/api/v1/admin/service-categories/10' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "message": "Service category deleted successfully"
}
```

---

<a id="services-create-service"></a>
### 9.5) Create Service (Admin/Super Admin)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/services`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "categoryId": 1,
  "label": "Post-op support",
  "desc": "Assistance after surgery.",
  "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "icon": "HeartPulse",
  "displayOrder": 4
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/services' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "categoryId": 1,
  "label": "Post-op support",
  "desc": "Assistance after surgery.",
  "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "icon": "HeartPulse",
  "displayOrder": 4
}'
```

### Success Response (201)

```json
{
  "message": "Service created successfully",
  "service": {
    "id": 20,
    "categoryId": 1,
    "label": "Post-op support",
    "desc": "Assistance after surgery.",
    "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "icon": "HeartPulse",
    "displayOrder": 4,
    "createdBy": "admin",
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-03-15T10:00:00.000Z"
  }
}
```

---

<a id="services-update-service"></a>
### 9.6) Update Service (Admin/Super Admin)

### Request

- Method: `PATCH`
- URL: `{{baseUrl}}/api/v1/admin/services/20`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON, any updatable fields):

```json
{
  "label": "Post-operative support",
  "displayOrder": 5
}
```

### cURL

```bash
curl --location --request PATCH '{{baseUrl}}/api/v1/admin/services/20' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "label": "Post-operative support",
  "displayOrder": 5
}'
```

### Success Response (200)

```json
{
  "message": "Service updated successfully",
  "service": {
    "id": 20,
    "categoryId": 1,
    "label": "Post-operative support",
    "desc": "Assistance after surgery.",
    "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "icon": "HeartPulse",
    "displayOrder": 5,
    "createdBy": "admin",
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-03-15T10:10:00.000Z"
  }
}
```

---

<a id="services-delete-service"></a>
### 9.7) Delete Service (Admin/Super Admin)

### Request

- Method: `DELETE`
- URL: `{{baseUrl}}/api/v1/admin/services/20`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location --request DELETE '{{baseUrl}}/api/v1/admin/services/20' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "message": "Service deleted successfully"
}
```

Notes:

- Create, update, and delete service/category endpoints require role `admin` or `super_admin`.

---

<a id="services-list-admin-categories"></a>
### 9.8) List Service Categories (Admin/Super Admin)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/service-categories`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/service-categories' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "title": "Household Chores",
      "displayOrder": 0,
      "createdBy": "super_admin",
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z"
    }
  ]
}
```

---

<a id="services-list-admin-services"></a>
### 9.9) List Services (Admin/Super Admin)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/services`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/services' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": 20,
      "categoryId": 1,
      "label": "Post-op support",
      "desc": "Assistance after surgery.",
      "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "icon": "HeartPulse",
      "displayOrder": 4,
      "createdBy": "admin",
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z"
    }
  ]
}
```

---

## 10) Email Templates CRUD (Super Admin)

<a id="email-templates-list"></a>
### 10.1) List Email Templates

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/email-templates?module=employee&isActive=true&search=verification`
- Auth: Bearer Token -> `{{accessToken}}`

Optional query params:

- `module`: `employee`, `user_registration`, `rfq`
- `isActive`: `true` or `false`
- `search`: partial match on `templateKey` or `description`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/email-templates?module=employee&isActive=true&search=verification' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "templateKey": "email_verification_code",
      "module": "employee",
      "channel": "email",
      "subjectTemplate": "Your verification code",
      "textTemplate": "Code: {{code}}",
      "htmlTemplate": "<p>Code: <strong>{{code}}</strong></p>",
      "variablesSchema": "{\"code\":\"string\"}",
      "description": "Employment email verification",
      "isActive": true,
      "createdBy": "super_admin",
      "createdAt": "2026-03-20T12:00:00.000Z",
      "updatedAt": "2026-03-20T12:00:00.000Z"
    }
  ]
}
```

---

<a id="email-templates-get"></a>
### 10.2) Get Email Template By ID

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/admin/email-templates/:id`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/email-templates/1' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "data": {
    "id": 1,
    "templateKey": "email_verification_code",
    "module": "employee",
    "channel": "email",
    "subjectTemplate": "Your verification code",
    "textTemplate": "Code: {{code}}",
    "htmlTemplate": "<p>Code: <strong>{{code}}</strong></p>",
    "variablesSchema": "{\"code\":\"string\"}",
    "description": "Employment email verification",
    "isActive": true,
    "createdBy": "super_admin",
    "createdAt": "2026-03-20T12:00:00.000Z",
    "updatedAt": "2026-03-20T12:00:00.000Z"
  }
}
```

---

<a id="email-templates-create"></a>
### 10.3) Create Email Template

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/email-templates`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "templateKey": "rfq_submission_ack",
  "module": "rfq",
  "channel": "email",
  "subjectTemplate": "We received your quote request",
  "textTemplate": "Hi {{name}}, we received your request.",
  "htmlTemplate": "<p>Hi {{name}}, we received your request.</p>",
  "variablesSchema": "{\"name\":\"string\"}",
  "description": "RFQ acknowledgement",
  "isActive": true
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/email-templates' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "templateKey": "rfq_submission_ack",
  "module": "rfq",
  "channel": "email",
  "subjectTemplate": "We received your quote request",
  "textTemplate": "Hi {{name}}, we received your request.",
  "htmlTemplate": "<p>Hi {{name}}, we received your request.</p>",
  "variablesSchema": "{\"name\":\"string\"}",
  "description": "RFQ acknowledgement",
  "isActive": true
}'
```

### Success Response (201)

```json
{
  "message": "Email template created successfully",
  "data": {
    "id": 7,
    "templateKey": "rfq_submission_ack",
    "module": "rfq",
    "channel": "email",
    "isActive": true,
    "createdBy": "super_admin",
    "createdAt": "2026-03-20T13:00:00.000Z",
    "updatedAt": "2026-03-20T13:00:00.000Z"
  }
}
```

---

<a id="email-templates-update"></a>
### 10.4) Update Email Template

### Request

- Method: `PATCH`
- URL: `{{baseUrl}}/api/v1/admin/email-templates/:id`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON, at least one field required):

```json
{
  "description": "RFQ acknowledgement email",
  "isActive": true
}
```

### cURL

```bash
curl --location --request PATCH '{{baseUrl}}/api/v1/admin/email-templates/7' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "description": "RFQ acknowledgement email",
  "isActive": true
}'
```

### Success Response (200)

```json
{
  "message": "Email template updated successfully",
  "data": {
    "id": 7,
    "templateKey": "rfq_submission_ack",
    "module": "rfq",
    "channel": "email",
    "description": "RFQ acknowledgement email",
    "isActive": true,
    "updatedAt": "2026-03-20T13:10:00.000Z"
  }
}
```

---

<a id="email-templates-delete"></a>
### 10.5) Deactivate Email Template

### Request

- Method: `DELETE`
- URL: `{{baseUrl}}/api/v1/admin/email-templates/:id`
- Auth: Bearer Token -> `{{accessToken}}`

### cURL

```bash
curl --location --request DELETE '{{baseUrl}}/api/v1/admin/email-templates/7' \
--header 'Authorization: Bearer {{accessToken}}'
```

### Success Response (200)

```json
{
  "message": "Email template deactivated successfully",
  "data": {
    "id": 7,
    "templateKey": "rfq_submission_ack",
    "isActive": false,
    "updatedAt": "2026-03-20T13:20:00.000Z"
  }
}
```

---

<a id="email-templates-test-send"></a>
### 10.6) Test Send Email Template

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/admin/email-templates/:id/test-send`
- Auth: Bearer Token -> `{{accessToken}}`
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "to": "qa@example.com",
  "data": {
    "name": "QA User",
    "code": "123456"
  }
}
```

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/admin/email-templates/1/test-send' \
--header 'Authorization: Bearer {{accessToken}}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "to": "qa@example.com",
  "data": {
    "name": "QA User",
    "code": "123456"
  }
}'
```

### Success Response (200)

```json
{
  "message": "Test email sent successfully"
}
```

Notes:

- All email template endpoints require role `super_admin`.

---

## 11) Testimonials

<a id="testimonials-list"></a>
### 11.1) List Active Testimonials (Public)

### Request

- Method: `GET`
- URL: `{{baseUrl}}/api/v1/testimonials`
- Auth: None

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/testimonials'
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": 1,
      "customerName": "Jane Doe",
      "customerEmail": "jane@example.com",
      "message": "Excellent and compassionate care.",
      "rating": 5,
      "profilePic": "https://example.com/profile/jane.jpg",
      "createdOn": "2026-03-10T10:00:00.000Z",
      "status": "active"
    }
  ]
}
```

---

## Suggested Postman Run Order

1. `Health Check`
2. `Admin Login` (captures `accessToken`)
3. `Create User`
4. `List Users`
5. `Change Password`

---

## 22) Submit RFQ (Public)

### Request

- Method: `POST`
- URL: `{{baseUrl}}/api/v1/rfqs`
- Auth: None
- Header: `Content-Type: application/json`

Body (raw JSON):

```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St, Toronto",
  "preferredContact": "email",
  "serviceSelected": [{"categoryId":1,"serviceId":2}],
  "startDate": "2024-05-01T10:00:00Z",
  "durationVal": 2,
  "durationType": "Week",
  "selfCare": true,
  "recipientName": "Jane Doe",
  "recipientRelation": "Mother"
}
```

Notes:

- `preferredContact` allowed values: `email`, `phone`, `any`.
- `durationType` allowed values: `Day`, `Week`, `Month`.
- `serviceSelected` is a JSON array of objects, e.g. `[{"categoryId":1,"serviceId":2}]`.
- `startDate` should be an ISO 8601 date string.

### cURL

```bash
curl --location '{{baseUrl}}/api/v1/rfqs' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St, Toronto",
  "preferredContact": "email",
  "serviceSelected": [{"categoryId":1,"serviceId":2}],
  "startDate": "2024-05-01T10:00:00Z",
  "durationVal": 2,
  "durationType": "Week",
  "selfCare": true,
  "recipientName": "Jane Doe",
  "recipientRelation": "Mother"
}'
```

### Success Response (201)

```json
{
  "success": true,
  "message": "RFQ submitted successfully",
  "data": {
    "id": 1,
    "rfqId": "8e4d6574-8f8f-4962-9f65-3a7c3dd67aa1",
    "status": "new",
    "createdAt": "2026-03-31T19:35:00.000Z",
    "updatedAt": "2026-03-31T19:35:00.000Z"
  }
}
```

---

## Common Error Responses

### Unauthorized (401)

```json
{
  "message": "Unauthorized"
}
```

### Forbidden (403)

```json
{
  "message": "Forbidden"
}
```

or

```json
{
  "message": "Missing permission"
}
```

### Validation Error (400)

```json
{
  "message": "Invalid request body",
  "errors": {
    "formErrors": [],
    "fieldErrors": {}
  }
}
```
