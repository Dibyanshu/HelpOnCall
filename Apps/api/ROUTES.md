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

## 3) Change Password

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

## 4) Create User (Super Admin)

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

## 5) List Users (Super Admin)

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
