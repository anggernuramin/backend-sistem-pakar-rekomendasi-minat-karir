# API Response Format Documentation

## Success Response

```json
{
  "success": true,
  "statusCode": number,
  "message": "string",
  "data": [],
  "meta": {
    "totalItems": number,
    "totalPages": number,
    "currentPage": number,
    "limit": number
  }
}
```

## Success Login Response

```json
{
  "success": true,
  "statusCode": number,
  "message": "string",
  "data": [],
  "token": {
    "access_token": "string" // JWT token for authentication
  }
}
```

## Error Response

```json
{
  "success": false,
  "statusCode": number,
  "message": "string",
  "error": {
    "key": "value",
    "password": "Password is required"
  }
}
```
