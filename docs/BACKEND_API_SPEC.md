# StudySync — Backend API Specification

**Audience:** Backend developers implementing the StudySync API  
**Frontend status:** UI wired to live API (`frontend/` services call Render backend when `VITE_DEV_BYPASS_AUTH` is not set)  
**Start here for current requirements:** [`BACKEND_HANDOFF.md`](./BACKEND_HANDOFF.md) — flows, endpoint checklist, request/response JSON, priorities  
**Out of scope:** Reliability score system (`/reliability/*`, `reliability:updated` WebSocket events)

---

## 1. System overview

StudySync is a context-aware collaborative learning platform for GCTU. Students register, complete onboarding (learning style, availability, courses, preferences), get matched into course-based study pods, and collaborate in a shared workspace (Kanban tasks, chat, shared files, group schedule).

### User roles

| Role | Value | Access |
|------|-------|--------|
| Student | `student` | Onboarding, matching, dashboard, workspaces |
| Instructor | `instructor` | Admin dashboard, cohort management, matching controls |

### High-level flow

```
Register → Onboarding (optional skip) → Find Groups (select course → search pod) → Match Found → Workspace
Login → Dashboard or /workspace (pod list) → /workspace/:groupId
```

See `BACKEND_HANDOFF.md` for the detailed course-selection flow.

### Frontend integration contract

| Setting | Value |
|---------|-------|
| REST base URL | `/api` (proxied to `http://localhost:3000` in dev) |
| WebSocket | Same origin, Socket.IO at `/socket.io` |
| Auth header | `Authorization: Bearer <jwt>` |
| Content-Type | `application/json` (except file uploads) |
| Env overrides | `VITE_API_BASE_URL`, `VITE_WS_URL` |

The axios client lives in `frontend/src/api/client.js`. On `401`, the frontend clears the stored token and user.

---

## 2. Suggested data model

These entities map directly to what the frontend expects. Use UUIDs for all primary keys unless noted.

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| email | string | unique |
| password_hash | string | |
| first_name, last_name | string | |
| student_id | string | |
| phone | string? | |
| university | string | see `frontend/src/utils/auth.js` |
| program | string | |
| level | enum | `100`, `200`, `300`, `400` |
| role | enum | `student`, `instructor` |
| created_at, updated_at | timestamp | |

### `user_profiles` (display profile — separate from registration)

| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID | FK → users, 1:1 |
| full_name | string | |
| student_role | string | e.g. "Computer Science Student" |
| primary_university | string | |
| secondary_university | string? | |
| location | string | |
| updated_at | timestamp | |

### `onboarding_profiles`

| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID | FK → users, 1:1 |
| learning_style | enum | `visual`, `auditory`, `reading`, `kinesthetic` |
| availability | JSON array | max 5 slots, format `"Mon-8 AM"` |
| study_preferences | JSON | `{ groupSize, timeCommitment, difficulty }` |
| completed_at | timestamp? | null until onboarding finished |
| saved_at | timestamp | |

**Availability slot format:** `{Day}-{Time}` where Day ∈ `Mon`–`Fri`, Time ∈ `8 AM`, `10 AM`, `12 PM`, `2 PM`, `4 PM`, `6 PM` (see `frontend/src/utils/onboarding.js`).

**Study preference enums:**

- `groupSize`: `small` (2–3), `medium` (4–6), `large` (7+)
- `timeCommitment`: `low` (1–3h), `medium` (4–7h), `high` (8+h)
- `difficulty`: `beginner`, `intermediate`, `advanced`

### `user_courses`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| user_id | UUID | |
| subject | string | e.g. `Biology`, `Computer Science` |
| course_number | string | e.g. `101` |
| is_primary | boolean | first valid course drives matching |

### `study_groups` (pods)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | internal ID |
| slug | string | URL-friendly, e.g. `biology-101` — used as `:groupId` in routes |
| title | string | e.g. `Biology 101 Study Group` |
| subject | string | |
| course_number | string | |
| cohort_id | UUID? | optional, for admin |
| created_at | timestamp | |

**Slug rule (must match frontend):** lowercase `{subject} {courseNumber}` with spaces → hyphens.

```js
// frontend/src/utils/onboarding.js
"Biology 101" → "biology-101"
```

### `group_members`

| Column | Type | Notes |
|--------|------|-------|
| group_id | UUID | |
| user_id | UUID | |
| joined_at | timestamp | |
| initials | string | derived from name, cached for UI |
| avatar_color | string | Tailwind class e.g. `bg-sky-500` |

### `tasks`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| group_id | UUID | |
| title | string | |
| status | enum | `todo`, `in_progress`, `completed` |
| variant | enum | `default`, `highlight`, `completed` |
| due_date | date? | ISO date `YYYY-MM-DD` |
| completed_at | date? | set when status = completed |
| assignee_id | UUID? | FK → users |
| position | int | order within column (for drag-and-drop) |
| created_at | timestamp | |

### `messages`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| group_id | UUID | |
| sender_id | UUID | |
| type | enum | `text`, `attachment`, `voice` |
| content | string | display text / summary |
| attachment_id | UUID? | FK → file storage record |
| voice_file_id | UUID? | FK → file storage record |
| voice_duration_sec | int? | max 120 |
| sent_at | timestamp | |

### `shared_files`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| group_id | UUID | |
| uploaded_by_id | UUID | |
| file_name | string | |
| file_size | int | bytes |
| file_type | string | MIME |
| storage_key | string | S3/local path |
| uploaded_at | timestamp | |

### `scheduled_sessions`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| group_id | UUID | |
| title | string | |
| date | date | `YYYY-MM-DD` |
| start_time | time | `HH:mm` (24h) |
| end_time | time | `HH:mm` |
| meeting_type | enum | `Online Meeting`, `In Person`, `Hybrid` |
| agenda | text? | |
| created_by_id | UUID? | |
| created_at | timestamp | |

### `cohorts` (admin)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| name | string | e.g. "CS Level 400 — Semester 1" |
| term | string? | |
| created_at | timestamp | |

### `matching_jobs` (optional but recommended)

Track async matching requests for progress UI and idempotency.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| user_id | UUID | |
| course_subject, course_number | string | |
| status | enum | `pending`, `running`, `completed`, `failed` |
| progress | int | 0–100 |
| current_step | string? | see matching steps below |
| result_group_id | UUID? | |
| created_at, completed_at | timestamp | |

---

## 3. Authentication

JWT-based. Access token in response body; frontend stores in `localStorage` key `studysync_token`.

### `POST /api/auth/register`

Creates account. Frontend navigates to `/onboarding` on success.

**Request body:**

```json
{
  "firstName": "Alex",
  "lastName": "Opoku",
  "studentId": "GCTU2024001",
  "email": "alex.opoku@gctu.edu.gh",
  "phone": "+233...",
  "university": "Ghana Communication Technology University (GCTU)",
  "program": "BSc. Computer Science",
  "level": "400",
  "role": "student",
  "password": "securepass",
  "agreeToTerms": true
}
```

> `confirmPassword` is validated client-side only — do not require it on the API.

**Response `201`:**

```json
{
  "token": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "Alex Opoku",
    "email": "alex.opoku@gctu.edu.gh",
    "role": "student",
    "studentId": "GCTU2024001",
    "university": "Ghana Communication Technology University (GCTU)",
    "program": "BSc. Computer Science",
    "level": "400",
    "phone": ""
  }
}
```

**Errors:** `400` validation, `409` email/studentId already exists.

### `POST /api/auth/login`

**Request:**

```json
{
  "email": "alex.opoku@gctu.edu.gh",
  "password": "securepass"
}
```

**Response `200`:** same `{ token, user }` shape as register.

**Errors:** `401` invalid credentials.

### `GET /api/auth/me`

Returns the current user from the JWT. Used on app load / session refresh.

**Response `200`:**

```json
{
  "id": "uuid",
  "name": "Alex Opoku",
  "email": "alex.opoku@gctu.edu.gh",
  "role": "student",
  "studentId": "GCTU2024001",
  "university": "...",
  "program": "...",
  "level": "400",
  "phone": ""
}
```

---

## 4. Onboarding

### `POST /api/onboarding/profile`

Save or update the full onboarding profile (called when user completes step 4).

**Auth:** student only.

**Request:**

```json
{
  "learningStyle": "visual",
  "availability": ["Mon-8 AM", "Tue-10 AM", "Wed-12 PM"],
  "courses": [
    { "id": "1", "subject": "Biology", "courseNumber": "101" },
    { "id": "2", "subject": "Mathematics", "courseNumber": "201" }
  ],
  "studyPreferences": {
    "groupSize": "small",
    "timeCommitment": "medium",
    "difficulty": "advanced"
  }
}
```

**Validation:**

- `availability`: max 5 slots
- `courses`: at least one with non-empty `subject` and `courseNumber`
- Reject unknown enum values

**Response `200`:**

```json
{
  "learningStyle": "visual",
  "availability": ["Mon-8 AM", "Tue-10 AM", "Wed-12 PM"],
  "courses": [...],
  "studyPreferences": { ... },
  "savedAt": "2026-06-24T10:00:00.000Z"
}
```

### `GET /api/onboarding/profile`

**Response `200`:** same shape, or `404` if not started.

---

## 5. User display profile

Separate from registration and onboarding — edited on `/profile`.

> No REST path is stubbed yet in the frontend. Add these endpoints; the frontend service (`userProfileService.js`) will be wired to them.

### `GET /api/users/me/profile`

**Response `200`:**

```json
{
  "fullName": "Alex Johnson",
  "studentRole": "Computer Science Student",
  "primaryUniversity": "GCTU",
  "secondaryUniversity": "Babcock University",
  "email": "alexjohnson@email.com",
  "location": "Accra, Ghana",
  "updatedAt": "2026-06-24T10:00:00.000Z"
}
```

### `PUT /api/users/me/profile`

**Request:** same fields except `email` is read-only (sourced from `users.email`).

**Response `200`:** updated profile object.

---

## 6. Matching

The find-groups page (`/find-groups`) currently simulates progress locally. The backend should drive real matching via REST + WebSocket.

### Matching steps (for progress UI)

These map to `MATCHING_STEPS` in `frontend/src/components/find-groups/MatchingProgress.jsx`:

| Step ID | Label |
|---------|-------|
| `course` | Finding students in your course |
| `preferences` | Analyzing your preferences |
| `compatibility` | Checking group compatibility |
| `searching` | Building your course pod |
| `finalizing` | Finalizing your best match |

### `POST /api/matching/find-group`

Start or resume matching for the authenticated student.

**Request:**

```json
{
  "course": {
    "subject": "Biology",
    "courseNumber": "101"
  },
  "learningStyle": "visual",
  "availability": ["Mon-8 AM", "Tue-10 AM"],
  "studyPreferences": {
    "groupSize": "small",
    "timeCommitment": "medium",
    "difficulty": "advanced"
  }
}
```

If `course` is omitted, use the user's primary course from onboarding.

**Response `202` (async recommended):**

```json
{
  "jobId": "uuid",
  "status": "running",
  "progress": 0,
  "currentStep": "course"
}
```

**Response `200` (sync / immediate match):**

```json
{
  "status": "completed",
  "progress": 100,
  "match": {
    "groupId": "biology-101",
    "groupTitle": "Biology 101 Study Group",
    "courseLabel": "Biology 101",
    "members": [
      {
        "id": "uuid",
        "name": "Joe Goldberg",
        "major": "CS Major",
        "initials": "JG",
        "color": "bg-sky-500"
      }
    ],
    "metrics": {
      "scheduleMatch": 85,
      "learningStyleMatch": 90,
      "avgGrades": 88
    }
  }
}
```

> `metrics` are display-only compatibility scores for the match-found screen. They are **not** the reliability score system (out of scope).

### `GET /api/matching/jobs/:jobId` (recommended)

Poll matching progress if not using WebSocket.

**Response:**

```json
{
  "jobId": "uuid",
  "status": "running",
  "progress": 65,
  "currentStep": "compatibility",
  "match": null
}
```

When `status` is `completed`, include the `match` object above.

### `GET /api/matching/course/:courseCode`

List open groups or match candidates for a course. `courseCode` is URL-encoded slug, e.g. `biology-101`.

**Response `200`:**

```json
{
  "courseCode": "biology-101",
  "groups": [
    {
      "groupId": "biology-101",
      "title": "Biology 101 Study Group",
      "memberCount": 4,
      "openSlots": 2
    }
  ]
}
```

### Matching algorithm (guidance)

Score candidates on:

1. Same course (subject + number) — hard filter
2. Availability overlap (slot intersection)
3. Learning style diversity or similarity (product decision)
4. `studyPreferences.groupSize` vs current group size
5. `timeCommitment` and `difficulty` alignment

Create a new group if no suitable pod exists; otherwise add the student to the best-scoring group.

### WebSocket: matching events

Emit to the user's personal room (`user:{userId}`):

| Event | Payload |
|-------|---------|
| `matching:progress` | `{ jobId, progress, currentStep, status }` |
| `matching:complete` | `{ jobId, match: { ... } }` |
| `matching:failed` | `{ jobId, error: string }` |

---

## 7. Dashboard & user's groups

The dashboard (`/dashboard`) shows active pods with progress and members. Currently hardcoded in `StudentDashboardPage.jsx`.

### `GET /api/users/me/groups` (new — required for dashboard)

**Response `200`:**

```json
{
  "groups": [
    {
      "id": "uuid",
      "groupId": "biology-101",
      "title": "Biology 101 Study Group",
      "progress": 25,
      "accent": "blue",
      "members": [
        { "id": "uuid", "initials": "AO", "name": "Alex Opoku", "color": "bg-sky-500" }
      ]
    }
  ]
}
```

**`progress`:** percentage of completed tasks in the group (backend-calculated).

**`accent`:** UI theme token — `blue`, `green`, `purple`, `amber` (rotate or hash from group id).

---

## 8. Workspaces

Base path: `/api/workspaces/:groupId` where `groupId` is the group **slug** (e.g. `biology-101`, `demo`).

**Authorization:** caller must be a member of the group. Return `403` otherwise, `404` if group does not exist.

### `GET /api/workspaces/:groupId`

Workspace metadata + member list.

**Response `200`:**

```json
{
  "groupId": "biology-101",
  "title": "Biology 101 Study Group",
  "courseLabel": "Biology 101",
  "members": [
    {
      "id": "uuid",
      "initials": "AO",
      "name": "Alex",
      "color": "bg-sky-500"
    }
  ]
}
```

---

## 9. Tasks (Kanban)

Frontend columns: `todo`, `in_progress`, `completed`.

### `GET /api/workspaces/:groupId/tasks`

**Response `200`:**

```json
{
  "todo": [
    {
      "id": "uuid",
      "title": "Review Chapter 3",
      "dueDate": "2024-10-20",
      "variant": "highlight",
      "assignee": {
        "id": "uuid",
        "initials": "AO",
        "name": "Alex",
        "color": "bg-sky-500"
      },
      "createdAt": "2024-10-12T09:00:00.000Z"
    }
  ],
  "in_progress": [],
  "completed": [
    {
      "id": "uuid",
      "title": "Study Big O notation",
      "completedAt": "2024-10-15",
      "variant": "completed",
      "assignee": { ... }
    }
  ]
}
```

### `POST /api/workspaces/:groupId/tasks`

**Request:**

```json
{
  "title": "Solve practice problems set 4",
  "dueDate": "2024-10-22",
  "assigneeId": "uuid"
}
```

Creates task in `todo`. **Response `201`:** full task object.

### `PATCH /api/workspaces/:groupId/tasks/:taskId`

Update task fields or move between columns.

**Request (partial):**

```json
{
  "title": "Updated title",
  "dueDate": "2024-10-25",
  "assigneeId": "uuid",
  "status": "in_progress",
  "variant": "default",
  "position": 2
}
```

When `status` changes to `completed`, set `completedAt` to today (ISO date) and `variant` to `completed`. When moving out of `completed`, clear `completedAt`.

**Response `200`:** updated task.

### `DELETE /api/workspaces/:groupId/tasks/:taskId`

**Response `204`.**

### Bulk reorder (optional)

Drag-and-drop may send multiple position updates. Either accept rapid `PATCH` calls or provide:

`PUT /api/workspaces/:groupId/tasks/reorder`

```json
{
  "tasks": [
    { "id": "uuid", "status": "in_progress", "position": 0 },
    { "id": "uuid", "status": "todo", "position": 1 }
  ]
}
```

---

## 10. Chat messages

### `GET /api/workspaces/:groupId/messages`

**Query:** `?limit=50&before=<messageId>` for pagination (oldest first within page).

**Response `200`:**

```json
{
  "messages": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "type": "text",
      "content": "Hey team!",
      "sentAt": "2024-10-12T09:15:00.000Z"
    },
    {
      "id": "uuid",
      "senderId": "uuid",
      "type": "attachment",
      "content": "Shared a file: notes.pdf",
      "attachment": {
        "fileName": "notes.pdf",
        "fileSize": 248000,
        "fileType": "application/pdf",
        "downloadUrl": "/api/workspaces/biology-101/files/uuid/download"
      },
      "sentAt": "2024-10-12T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "senderId": "uuid",
      "type": "voice",
      "content": "Sent a voice message",
      "voice": {
        "durationSec": 12,
        "mimeType": "audio/webm",
        "fileName": "voice.webm",
        "fileSize": 45000,
        "streamUrl": "/api/workspaces/biology-101/messages/uuid/voice"
      },
      "sentAt": "2024-10-12T10:05:00.000Z"
    }
  ]
}
```

### `POST /api/workspaces/:groupId/messages`

**Text message:**

```json
{
  "type": "text",
  "content": "Hey team!"
}
```

**Attachment** — use `multipart/form-data`:

| Field | Type |
|-------|------|
| `type` | `attachment` |
| `file` | binary (max 10 MB) |

**Voice** — use `multipart/form-data`:

| Field | Type |
|-------|------|
| `type` | `voice` |
| `file` | audio binary (max 2 MB) |
| `durationSec` | number (max 120) |

> Do **not** accept base64 audio in JSON for production. The frontend currently stores voice as `audioDataUrl` in localStorage for dev only; swap to multipart upload.

**Response `201`:** created message object.

### `DELETE /api/workspaces/:groupId/messages/:messageId`

Only the sender may delete. **Response `204`**, `403` if not owner.

---

## 11. Shared files

Distinct from chat attachments — persisted file library on `/workspace/:groupId/files`.

### `GET /api/workspaces/:groupId/files`

**Response `200`:**

```json
{
  "files": [
    {
      "id": "uuid",
      "fileName": "DP_Chapter3_Notes.pdf",
      "fileSize": 248000,
      "fileType": "application/pdf",
      "uploadedBy": "Sarah",
      "uploadedById": "uuid",
      "uploadedAt": "2024-10-10T14:20:00.000Z",
      "downloadUrl": "/api/workspaces/biology-101/files/uuid/download"
    }
  ]
}
```

### `POST /api/workspaces/:groupId/files`

`multipart/form-data`, field `file`, max **10 MB**.

**Response `201`:** file metadata object.

### `GET /api/workspaces/:groupId/files/:fileId/download`

Stream the file. **Response `200`** with appropriate `Content-Type` and `Content-Disposition`.

### `DELETE /api/workspaces/:groupId/files/:fileId`

Only uploader may delete. **Response `204`**, `403` if not owner.

---

## 12. Scheduled sessions

### `GET /api/workspaces/:groupId/sessions`

Sorted ascending by `date` + `startTime`.

**Response `200`:**

```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Study Session - Dynamic Programming",
      "date": "2024-01-12",
      "startTime": "12:00",
      "endTime": "14:00",
      "meetingType": "Online Meeting",
      "agenda": "Cover chapter 3",
      "memberCount": 4,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

`memberCount` = current group member count (or RSVP count if you add that later).

### `POST /api/workspaces/:groupId/sessions`

**Request:**

```json
{
  "title": "Quiz preparation",
  "date": "2024-02-20",
  "startTime": "10:00",
  "endTime": "13:00",
  "meetingType": "Online Meeting",
  "agenda": "Practice problems"
}
```

**Validation:**

- `meetingType` ∈ `Online Meeting`, `In Person`, `Hybrid`
- `endTime` > `startTime`
- Times in `HH:mm` 24-hour format

**Response `201`:** session object.

### `PATCH /api/workspaces/:groupId/sessions/:sessionId`

Partial update. **Response `200`.**

### `DELETE /api/workspaces/:groupId/sessions/:sessionId`

**Response `204`.**

---

## 13. WebSocket (Socket.IO)

### Connection

```js
io(url, {
  auth: { token: '<jwt>' },
  query: { groupId: 'biology-101' }, // optional on connect
})
```

Validate JWT on connection. Reject unauthenticated sockets.

### Rooms

| Room | Purpose |
|------|---------|
| `user:{userId}` | Personal events (matching) |
| `workspace:{groupId}` | Group collaboration events |

### Client → server events

| Event | Payload | Notes |
|-------|---------|-------|
| `join:workspace` | `{ groupId }` | Verify membership before joining room |
| `leave:workspace` | `{ groupId }` | |

### Server → client events

| Event | Payload | Notes |
|-------|---------|-------|
| `task:created` | `{ groupId, task }` | Full task object |
| `task:updated` | `{ groupId, task }` | After PATCH / reorder |
| `task:deleted` | `{ groupId, taskId }` | |
| `message:new` | `{ groupId, message }` | After POST message |
| `session:created` | `{ groupId, session }` | optional |
| `session:updated` | `{ groupId, session }` | optional |
| `file:uploaded` | `{ groupId, file }` | optional |
| `file:deleted` | `{ groupId, fileId }` | optional |

> **Ignore for now:** `reliability:updated` — defined in the frontend WebSocket service but explicitly out of scope.

---

## 14. Admin API (instructor role)

All routes require `role: instructor`. Frontend pages are scaffolded only.

### `GET /api/admin/cohorts`

**Response:**

```json
{
  "cohorts": [
    { "id": "uuid", "name": "CS 400 — Fall 2026", "studentCount": 120, "groupCount": 15 }
  ]
}
```

### `POST /api/admin/cohorts`

Create cohort.

### `POST /api/admin/seed`

Seed demo/staging data for a cohort.

**Request:**

```json
{
  "cohortId": "uuid",
  "studentCount": 50,
  "courses": [{ "subject": "Computer Science", "courseNumber": "401" }]
}
```

### `POST /api/admin/matching/run`

Run batch matching for a cohort or course.

**Request:**

```json
{
  "cohortId": "uuid",
  "courseCode": "computer-science-401"
}
```

**Response `202`:**

```json
{
  "jobId": "uuid",
  "status": "running",
  "groupsCreated": 0,
  "studentsMatched": 0
}
```

### `GET /api/admin/groups`

List all study groups with summary stats.

### `GET /api/admin/students`

List students with onboarding status and group assignments. Support `?cohortId=&courseCode=&page=`.

---

## 15. Error format

Use a consistent JSON error body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [
      { "field": "availability", "message": "Maximum 5 slots allowed" }
    ]
  }
}
```

| HTTP | When |
|------|------|
| 400 | Validation failure |
| 401 | Missing/invalid token |
| 403 | Authenticated but not allowed (wrong role, not group member) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, already in group) |
| 413 | File too large |
| 500 | Server error |

---

## 16. File storage

| Use case | Max size | Format |
|----------|----------|--------|
| Chat attachment | 10 MB | multipart |
| Voice message | 2 MB, ≤ 120 s | multipart audio |
| Shared file | 10 MB | multipart |

Store files in object storage (S3, Azure Blob, or local `uploads/` for dev). Persist only metadata + storage key in the database. Serve downloads via authenticated endpoints, not public URLs.

---

## 17. Security checklist

- Hash passwords (bcrypt/argon2)
- Validate JWT on every protected route and WebSocket connection
- Enforce group membership on all `/workspaces/:groupId/*` routes
- Sanitize message `content` (XSS)
- Virus-scan uploads (production)
- Rate-limit auth and message endpoints
- CORS: allow frontend origin in production

---

## 18. Frontend swap checklist

When the API is ready, the frontend team will:

1. Set `DEV_BYPASS_AUTH = false` (or remove dev bypass in `constants.js`)
2. Replace `localStorage` calls in:
   - `onboardingProfileService.js` → `/onboarding/profile`
   - `userProfileService.js` → `/users/me/profile`
   - `workspaceTaskService.js` → `/workspaces/:groupId/tasks`
   - `workspaceChatService.js` → `/workspaces/:groupId/messages`
   - `workspaceFileService.js` → `/workspaces/:groupId/files`
   - `scheduleSessionService.js` → `/workspaces/:groupId/sessions`
3. Replace `useSimulatedMatchingProgress` with API/WebSocket-driven matching
4. Wire `subscribeToWorkspaceEvents` in workspace pages for live updates
5. Replace hardcoded `activePods` on dashboard with `GET /users/me/groups`
6. Replace `WORKSPACE_MEMBERS` mock with members from `GET /workspaces/:groupId`

---

## 19. Reference map

| Frontend file | Backend area |
|---------------|--------------|
| `frontend/src/api/endpoints.js` | Route paths (except reliability) |
| `frontend/src/api/client.js` | Axios + JWT interceptor |
| `frontend/src/services/authService.js` | Auth |
| `frontend/src/services/onboardingProfileService.js` | Onboarding + matching input |
| `frontend/src/services/userProfileService.js` | Display profile |
| `frontend/src/services/workspaceTaskService.js` | Kanban tasks |
| `frontend/src/services/workspaceChatService.js` | Chat |
| `frontend/src/services/workspaceFileService.js` | Shared files |
| `frontend/src/services/scheduleSessionService.js` | Sessions |
| `frontend/src/services/websocketService.js` | Real-time events |
| `frontend/src/utils/onboarding.js` | Enums, group slug rule |
| `frontend/vite.config.js` | Proxy: `/api` → `:3000`, `/socket.io` WS |

---

## 20. Suggested implementation order

1. **Auth** — register, login, me, JWT middleware
2. **Onboarding** — profile CRUD + user courses
3. **Groups** — create groups, membership, slug generation
4. **Matching** — find-group job + progress events
5. **Workspace read** — group metadata, tasks/messages/files/sessions GET
6. **Workspace write** — task CRUD, messages, file upload, sessions
7. **WebSocket** — join room + broadcast task/message events
8. **Dashboard** — user's groups with task progress
9. **Admin** — cohorts, seed, batch matching
10. **User display profile** — GET/PUT profile

---

*Document version: 1.0 — generated from frontend implementation, June 2026*
