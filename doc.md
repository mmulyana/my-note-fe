# Documentation Endpoint API

## 1. Get All Notes (`GET /notes`)

Retrieves a paginated list of notes filtered by query parameters.

### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `labelId` | `string (UUID)` | Filter notes by label ID |
| `folderId` | `string (UUID)` | Filter notes by folder ID |
| `hasFolder` | `boolean` | `true` for notes inside a folder, `false` for loose notes without folder |
| `archived` | `boolean` | Filter by archived status |
| `pinned` | `boolean` | Filter by pinned status |
| `q` | `string` | Search query for title/content |
| `page` | `integer` | Page number (default: `1`) |
| `limit` | `integer` | Items per page (default: `50`, max: `100`) |

---

## 2. Get Folders with Notes (`GET /folders/with-notes`)

Retrieves a paginated list of folders along with their associated notes.

### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `page` | `integer` | Page number (default: `1`) |
| `limit` | `integer` | Items per page (default: `50`, max: `100`) |

### Response Example

```json
{
  "message": "ok",
  "data": [
    {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "name": "Personal",
      "color": "default",
      "secret": false,
      "createdAt": "2026-08-21T21:00:00Z",
      "updatedAt": "2026-08-21T21:00:00Z",
      "notes": [
        {
          "title": "Shopping List",
          "text": "Milk, Eggs, Bread"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```
