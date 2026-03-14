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

## Suggested Postman Run Order

1. `Health Check`
2. `Admin Login` (captures `accessToken`)
3. `Create User`
4. `List Users`
5. `Change Password`

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
