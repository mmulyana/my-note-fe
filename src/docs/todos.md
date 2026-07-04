# Todos API

Base URL: `/api/todos`

Semua endpoint membutuhkan header `Authorization: Bearer <token>`.

---

## GET /api/todos

Ambil semua todos milik user yang sedang login.

**Response 200**
```json
{
  "message": "ok",
  "data": [
    {
      "id": "todo-abc123",
      "noteId": "note-xyz789",
      "text": "Buat unit test",
      "checked": false,
      "deadline": "2024-12-31",
      "priority": "high",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## GET /api/todos/group/notes

Ambil todos dikelompokkan berdasarkan note.

**Response 200**
```json
{
  "message": "ok",
  "data": [
    {
      "noteId": "note-xyz789",
      "title": "Sprint Planning",
      "todos": [
        {
          "id": "todo-abc123",
          "noteId": "note-xyz789",
          "text": "Buat unit test",
          "checked": false,
          "deadline": "2024-12-31",
          "priority": "high",
          "createdAt": "2024-01-15T10:00:00Z",
          "updatedAt": "2024-01-15T10:00:00Z"
        }
      ]
    }
  ]
}
```

---

## GET /api/todos/group/deadline

Ambil todos dikelompokkan berdasarkan deadline.

**Response 200**
```json
{
  "message": "ok",
  "data": [
    {
      "deadline": "2024-12-31",
      "todos": [
        {
          "id": "todo-abc123",
          "noteId": "note-xyz789",
          "text": "Buat unit test",
          "checked": false,
          "deadline": "2024-12-31",
          "priority": "high",
          "createdAt": "2024-01-15T10:00:00Z",
          "updatedAt": "2024-01-15T10:00:00Z"
        }
      ]
    },
    {
      "deadline": null,
      "todos": [
        {
          "id": "todo-def456",
          "noteId": "note-xyz789",
          "text": "Refactor handler",
          "checked": false,
          "deadline": null,
          "priority": "low",
          "createdAt": "2024-01-15T11:00:00Z",
          "updatedAt": "2024-01-15T11:00:00Z"
        }
      ]
    }
  ]
}
```

---

## GET /api/todos/:id

Ambil satu todo berdasarkan ID.

**Path Params**
| Param | Type   | Keterangan   |
|-------|--------|--------------|
| id    | string | ID dari todo |

**Response 200**
```json
{
  "message": "ok",
  "data": {
    "id": "todo-abc123",
    "noteId": "note-xyz789",
    "text": "Buat unit test",
    "checked": false,
    "deadline": "2024-12-31",
    "priority": "high",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Response 404**
```json
{
  "message": "todo not found",
  "data": null
}
```

---

## POST /api/todos

Buat todo baru dan sync ke HTML content/preview note.

Ketika todo dibuat, selain disimpan ke tabel `todos`, backend juga **menyisipkan elemen `<li>` ke dalam kolom `content` dan `preview`** milik note yang bersangkutan. Ini menjaga agar HTML di note selalu sinkron dengan data todo di database.

**Logika penyisipan `<li>` ke content:**
1. Jika `lastTodoId` dikirim dan ditemukan di content → sisipkan tepat **setelah** `<li>` dengan `data-id` tersebut.
2. Jika `lastTodoId` tidak dikirim / tidak ditemukan → tambahkan di akhir `<ul data-type="taskList">` terakhir yang ada.
3. Jika tidak ada `<ul data-type="taskList">` sama sekali → buat baru di akhir content.

> Content lain **tidak** terhapus atau terubah — hanya insert/append.

**Request Body**
| Field      | Type                | Required | Keterangan                                                                 |
|------------|---------------------|----------|---------------------------------------------------------------------------|
| id         | string              | Ya       | ID unik untuk todo (di-generate client)                                    |
| noteId     | string              | Ya       | ID note yang menjadi parent                                                |
| text       | string              | Tidak    | Isi teks todo                                                              |
| checked    | boolean             | Tidak    | Status selesai (default: `false`)                                          |
| deadline   | string (YYYY-MM-DD) | Tidak    | Batas waktu                                                                |
| priority   | string              | Tidak    | `low` / `medium` / `high` (default: `medium`)                             |
| lastTodoId | string              | Tidak    | ID todo sebelumnya — todo baru disisipkan setelah todo ini di HTML content |

```json
{
  "id": "todo-abc123",
  "noteId": "note-xyz789",
  "text": "Buat unit test",
  "checked": false,
  "deadline": "2024-12-31",
  "priority": "high",
  "lastTodoId": "_ovlun8T"
}
```

**Response 201**
```json
{
  "message": "created",
  "data": {
    "id": "todo-abc123",
    "noteId": "note-xyz789",
    "text": "Buat unit test",
    "checked": false,
    "deadline": "2024-12-31",
    "priority": "high",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Response 404** — jika `noteId` tidak ditemukan
```json
{
  "message": "note not found",
  "data": null
}
```

---

## PATCH /api/todos/:id

Update todo. Semua field opsional, hanya field yang dikirim yang diupdate.

**Path Params**
| Param | Type   | Keterangan   |
|-------|--------|--------------|
| id    | string | ID dari todo |

**Request Body**
| Field    | Type             | Keterangan                        |
|----------|------------------|-----------------------------------|
| text     | string           | Isi teks todo                     |
| checked  | boolean          | Status selesai                    |
| deadline | string (YYYY-MM-DD) | Batas waktu (`null` untuk hapus) |
| priority | string           | `low` / `medium` / `high`         |

```json
{
  "checked": true,
  "priority": "low"
}
```

**Response 200**
```json
{
  "message": "updated",
  "data": {
    "id": "todo-abc123",
    "noteId": "note-xyz789",
    "text": "Buat unit test",
    "checked": true,
    "deadline": "2024-12-31",
    "priority": "low",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response 404**
```json
{
  "message": "todo not found",
  "data": null
}
```

---

## DELETE /api/todos/:id

Hapus todo berdasarkan ID.

**Path Params**
| Param | Type   | Keterangan   |
|-------|--------|--------------|
| id    | string | ID dari todo |

**Response 200**
```json
{
  "message": "deleted",
  "data": {
    "id": "todo-abc123"
  }
}
```

**Response 404**
```json
{
  "message": "todo not found",
  "data": null
}
```

---

## Error Umum

| Status | Message            | Penyebab                          |
|--------|--------------------|-----------------------------------|
| 400    | invalid user id    | Token JWT tidak mengandung user ID yang valid |
| 400    | `<validation msg>` | Request body tidak sesuai validasi |
| 404    | todo not found     | Todo dengan ID tersebut tidak ada atau bukan milik user |
| 500    | `<error msg>`      | Error internal server              |
