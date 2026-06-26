# StudySync — Backend Handoff (Frontend Integration)

**For:** Backend developers  
**Frontend repo:** `study-sync/frontend` (wired to real API — no mock data in production)  
**Deployed API (reference):** `https://studysync-backend-5i2a.onrender.com/api`  
**Swagger:** `https://studysync-backend-5i2a.onrender.com/api-docs/`  
**Full data model & endpoint reference:** `docs/BACKEND_API_SPEC.md`

This document describes **what the frontend expects today** after recent UI work. Implement or fix the items below so the live app works end-to-end.

---

## 1. How the app works now (user flows)

### Flow A — Register & onboard
```
POST /auth/register → POST /auth/login
→ GET/POST /onboarding/profile (4 steps: style, availability, courses, preferences)
→ /find-groups (course selection — see Flow B)
```

User can **Skip for now** on onboarding → dashboard with no profile (`GET /onboarding/profile` → 404).

### Flow B — Join a pod (Find Groups) — **important change**
```
/find-groups
  Step 1: User SELECTS a course (from profile) OR ADDS a new course
  Step 2: User clicks "Search for a pod"
          → POST /onboarding/profile (saves courses + preferences)
          → GET /matching/course/:courseCode (preview groups)
          → POST /matching/find-group (body includes explicit course)
  Step 3: Poll GET /matching/jobs/:jobId OR immediate match response
  Step 4: Match found → user opens /workspace/:groupId
```

**Backend must match on the course sent in the request**, not only a stored “primary” course.

### Flow C — Workspace
```
/workspace              → GET /users/me/groups (list all pods)
/workspace/:groupId     → GET /workspaces/:groupId (metadata + members)
  /board                → GET/PATCH /workspaces/:groupId/tasks
  /chat                 → GET/POST /workspaces/:groupId/messages
  /files                → GET/POST /workspaces/:groupId/files
  /calendar             → GET/POST /workspaces/:groupId/sessions
```

Clicking a **member avatar** in chat → `GET /users/:userId/profile` (see §5.1 — **new endpoint**).

### Flow D — Dashboard & profile
```
/dashboard    → GET /users/me/groups
/profile      → GET/PUT /users/me/profile + GET/POST /onboarding/profile
```

---

## 2. Global API contract

| Item | Value |
|------|--------|
| Base path | `/api` |
| Auth | `Authorization: Bearer <jwt>` on all routes below except register/login |
| JSON errors | `{ "error": { "code": "STRING", "message": "string", "details": [{ "field", "message" }] } }` |
| 401 | Frontend clears token and redirects to login |
| 403 | Not a group member / not allowed |
| 404 | Resource not found (onboarding not started is valid 404) |

### Group slug rule (must match frontend)

```text
subject: "Biology", courseNumber: "101"
→ courseCode / groupId slug: "biology-101"

Rule: lowercase(trim(subject) + " " + trim(courseNumber)), spaces → hyphens
Example: "Computer Science" + "201" → "computer-science-201"
```

Used in: matching, workspaces, dashboard links, `GET /matching/course/:courseCode`.

---

## 3. Endpoint status vs deployed backend

Legend: ✅ exists · ⚠️ exists but needs contract fixes · ❌ missing

| Method | Path | Status | Frontend usage |
|--------|------|--------|----------------|
| POST | `/auth/register` | ✅ | Register |
| POST | `/auth/login` | ✅ | Login |
| GET | `/auth/me` | ✅ | Session refresh |
| GET | `/onboarding/profile` | ✅ | Load onboarding; 404 = not started |
| POST | `/onboarding/profile` | ⚠️ | Save full profile + **courses[]** from Find Groups |
| GET | `/users/me/profile` | ✅ | Profile page |
| PUT | `/users/me/profile` | ✅ | Edit profile |
| GET | `/users/:userId/profile` | ❌ | Member profile modal in workspace chat |
| GET | `/users/me/groups` | ⚠️ | Dashboard + `/workspace` pod list |
| POST | `/matching/find-group` | ⚠️ | Must accept explicit `course` in body |
| GET | `/matching/jobs/:jobId` | ⚠️ | Poll progress; waiting + completed states |
| GET | `/matching/course/:courseCode` | ⚠️ | Preview groups before/during search |
| POST | `/matching/groups/:groupId/join` | ✅ | Not called by frontend yet — clarify vs auto-join on match |
| POST | `/matching/groups/:groupId/leave` | ✅ | Not called by frontend yet |
| GET | `/workspaces/:groupId` | ⚠️ | Title, courseLabel, members[] |
| GET | `/workspaces/:groupId/tasks` | ⚠️ | Kanban columns |
| POST | `/workspaces/:groupId/tasks` | ⚠️ | Add task |
| PATCH | `/workspaces/:groupId/tasks/:taskId` | ⚠️ | Move/update task (`status`, `position`) |
| DELETE | `/workspaces/:groupId/tasks/:taskId` | ✅ | Optional |
| PUT | `/workspaces/:groupId/tasks/reorder` | ❌ | Optional; frontend falls back to multiple PATCH |
| GET | `/workspaces/:groupId/messages` | ⚠️ | Chat history |
| POST | `/workspaces/:groupId/messages` | ⚠️ | Text JSON + multipart attachment/voice |
| DELETE | `/workspaces/:groupId/messages/:messageId` | ❌ | Delete own message |
| GET | `/workspaces/:groupId/files` | ⚠️ | File list + downloadUrl |
| POST | `/workspaces/:groupId/files` | ⚠️ | multipart upload |
| DELETE | `/workspaces/:groupId/files/:fileId` | ❌ | Delete own file |
| GET | `/workspaces/:groupId/files/:fileId/download` | ⚠️ | File download stream |
| GET | `/workspaces/:groupId/sessions` | ⚠️ | Group schedule |
| POST | `/workspaces/:groupId/sessions` | ⚠️ | Create session |
| PATCH | `/workspaces/:groupId/sessions/:sessionId` | ❌ | Edit session |
| DELETE | `/workspaces/:groupId/sessions/:sessionId` | ❌ | Delete session |

---

## 4. Required implementations (by area)

### 4.1 Onboarding profile

**`GET /api/onboarding/profile`**  
- Return `404` if user never saved onboarding (frontend handles this).
- Response body:

```json
{
  "learningStyle": "visual",
  "availability": ["Mon-8 AM", "Tue-10 AM"],
  "courses": [
    { "id": "uuid-or-string", "subject": "Biology", "courseNumber": "101" },
    { "id": "uuid-or-string", "subject": "Computer Science", "courseNumber": "201" }
  ],
  "studyPreferences": {
    "groupSize": "small",
    "timeCommitment": "medium",
    "difficulty": "advanced"
  },
  "savedAt": "2024-10-12T09:00:00.000Z"
}
```

**`POST /api/onboarding/profile`**  
- Upsert full profile. Called from:
  - Onboarding wizard (step 4)
  - **Find Groups** when user clicks “Search for a pod” (may include newly added courses)
  - Profile page (“Save changes”)
- Validation:
  - `learningStyle` ∈ `visual` | `auditory` | `reading` | `kinesthetic`
  - `availability` — max 5 slots, format `"Mon-8 AM"` (day Mon–Fri, times: `8 AM`, `10 AM`, `12 PM`, `2 PM`, `4 PM`, `6 PM`)
  - `courses` — at least one entry with non-empty `subject` and `courseNumber`
  - `studyPreferences.groupSize` ∈ `small` | `medium` | `large`
  - `studyPreferences.timeCommitment` ∈ `low` | `medium` | `high`
  - `studyPreferences.difficulty` ∈ `beginner` | `intermediate` | `advanced`
- **Skip onboarding:** user may POST for the first time from Find Groups with default preferences + one new course. Do not require a prior GET.

---

### 4.2 Matching (course-selected search)

**`POST /api/matching/find-group`**

Request (frontend always sends this shape):

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

**Business rules:**
1. Match only students enrolled in the **same** `subject` + `courseNumber`.
2. One study group per course per user. If already in a group for that course → **`409`** with:
   ```json
   { "error": { "code": "ALREADY_IN_GROUP", "message": "You are already in a study group for this course." } }
   ```
3. If no other students exist for that course → return waiting state (do not treat as 500):
   ```json
   {
     "status": "waiting",
     "errorCode": "NO_ENROLLED_STUDENTS",
     "progress": 20,
     "currentStep": "course"
   }
   ```
4. On successful match, **add user to `group_members`** so dashboard and workspace work immediately.

**Async response (202 recommended):**

```json
{
  "jobId": "uuid",
  "status": "running",
  "progress": 0,
  "currentStep": "course"
}
```

**Immediate match (200):**

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
        "id": "user-uuid",
        "name": "Alex Opoku",
        "major": "Computer Science Student",
        "initials": "AO",
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

`metrics` are display-only compatibility scores (not reliability).

**Matching step IDs** (for `currentStep` and job polling):

| `currentStep` | UI label |
|---------------|----------|
| `course` | Finding students in your course |
| `preferences` | Analyzing your preferences |
| `compatibility` | Checking group compatibility |
| `searching` | Building your course pod |
| `finalizing` | Finalizing your best match |

---

**`GET /api/matching/jobs/:jobId`**

```json
{
  "jobId": "uuid",
  "status": "running",
  "progress": 65,
  "currentStep": "compatibility",
  "match": null
}
```

When `status` is `completed`, include `match` (same object as above).  
When `status` is `failed`:
```json
{ "jobId": "uuid", "status": "failed", "error": "Human message", "errorCode": "NO_ENROLLED_STUDENTS" }
```
When `status` is `waiting`, same as find-group waiting response.

---

**`GET /api/matching/course/:courseCode`**

`courseCode` = URL-encoded slug (e.g. `biology-101`).

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

Return `{ "courseCode": "...", "groups": [] }` when no groups exist (not 404).

---

### 4.3 User groups (dashboard + workspace pod list)

**`GET /api/users/me/groups`**

Returns every study pod the authenticated user belongs to.

```json
{
  "groups": [
    {
      "id": "internal-uuid",
      "groupId": "biology-101",
      "title": "Biology 101 Study Group",
      "progress": 25,
      "accent": "blue",
      "members": [
        {
          "id": "user-uuid",
          "name": "Alex Opoku",
          "initials": "AO",
          "color": "bg-sky-500"
        }
      ]
    }
  ]
}
```

- `progress` — backend-calculated % of completed tasks in that group (0–100).
- `accent` — UI theme: `blue` | `green` | `purple` | `amber` (hash from groupId is fine).
- `groupId` — slug used in routes `/workspace/:groupId`.

---

### 4.4 Member profile (NEW)

**`GET /api/users/:userId/profile`**

Used when a student clicks another member’s avatar in workspace chat.

**Authorization:** caller must share at least one study group with `:userId`. Otherwise `403`.

**Response (public pod profile — do not return email to other users):**

```json
{
  "fullName": "Sarah Mensah",
  "studentRole": "Computer Science Student",
  "primaryUniversity": "GCTU",
  "secondaryUniversity": "",
  "location": "Accra, Ghana"
}
```

For `GET /users/me/profile`, email may be included. For other users’ profiles, omit `email`.

---

### 4.5 Workspace metadata

**`GET /api/workspaces/:groupId`**

`:groupId` = slug (e.g. `biology-101`). Caller must be a member → else `403`.

```json
{
  "groupId": "biology-101",
  "title": "Biology 101 Study Group",
  "courseLabel": "Biology 101",
  "members": [
    {
      "id": "user-uuid",
      "name": "Alex",
      "initials": "AO",
      "color": "bg-sky-500"
    }
  ]
}
```

Optional on members: `major` or `role` (shown in match-found and profile modal).

---

### 4.6 Tasks (Kanban)

**`GET /api/workspaces/:groupId/tasks`**

```json
{
  "todo": [
    {
      "id": "uuid",
      "title": "Review Chapter 3",
      "dueDate": "2024-10-20",
      "variant": "default",
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
      "assignee": { "id": "...", "initials": "AO", "name": "Alex", "color": "bg-sky-500" }
    }
  ]
}
```

**`POST /api/workspaces/:groupId/tasks`**

```json
{ "title": "New task", "dueDate": "2024-10-22", "assigneeId": "uuid" }
```

Creates in `todo`. Response `201`: full task object.

**`PATCH /api/workspaces/:groupId/tasks/:taskId`**

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

- When `status` → `completed`: set `completedAt` (ISO date `YYYY-MM-DD`), `variant` → `completed`.
- When moving out of `completed`: clear `completedAt`.

**Drag-and-drop:** frontend sends multiple PATCH calls with `{ id, status, position }` per task.  
**Optional:** `PUT /api/workspaces/:groupId/tasks/reorder` with `{ "tasks": [{ "id", "status", "position" }] }` returning full board (frontend will use this if available).

---

### 4.7 Chat messages

**`GET /api/workspaces/:groupId/messages`**

```json
{
  "messages": [
    {
      "id": "uuid",
      "senderId": "user-uuid",
      "type": "text",
      "content": "Hey team!",
      "sentAt": "2024-10-12T09:15:00.000Z"
    },
    {
      "id": "uuid",
      "senderId": "user-uuid",
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
      "senderId": "user-uuid",
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

**`POST /api/workspaces/:groupId/messages`**

Text (JSON):
```json
{ "type": "text", "content": "Hey team!" }
```

Attachment (multipart/form-data): `type=attachment`, `file` (max 10 MB).  
Voice (multipart/form-data): `type=voice`, `file`, `durationSec` (max 120 sec, max 2 MB).

**`DELETE /api/workspaces/:groupId/messages/:messageId`** — sender only, `204`.

---

### 4.8 Shared files

**`GET /api/workspaces/:groupId/files`**

```json
{
  "files": [
    {
      "id": "uuid",
      "fileName": "DP_Chapter3_Notes.pdf",
      "fileSize": 248000,
      "fileType": "application/pdf",
      "uploadedBy": "Sarah",
      "uploadedById": "user-uuid",
      "uploadedAt": "2024-10-10T14:20:00.000Z",
      "downloadUrl": "/api/workspaces/biology-101/files/uuid/download"
    }
  ]
}
```

**`POST`** — multipart, field `file`, max 10 MB.  
**`GET .../files/:fileId/download`** — stream file with correct `Content-Type` / `Content-Disposition`.  
**`DELETE .../files/:fileId`** — uploader only, `204`.

---

### 4.9 Scheduled sessions

**`GET /api/workspaces/:groupId/sessions`**

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

Sorted ascending by `date` + `startTime`.  
`meetingType` ∈ `Online Meeting` | `In Person` | `Hybrid`. Times in `HH:mm` 24h. `endTime` > `startTime`.

**`POST`** — create session (request body matches fields above except `id`, `memberCount`, `createdAt`).

---

### 4.10 WebSocket (Socket.IO)

**Connection:** same host as API; auth via `{ token: jwt }`.

| Client → server | Payload |
|-----------------|---------|
| `join:workspace` | `{ "groupId": "biology-101" }` |
| `leave:workspace` | `{ "groupId": "biology-101" }` |

| Server → client (workspace room) | Payload |
|----------------------------------|---------|
| `task:created` | task object |
| `task:updated` | task object |
| `task:deleted` | `{ "id": "task-uuid" }` |
| `message:new` | message object |

| Server → client (user room `user:{userId}`) | Payload |
|-----------------------------------------------|---------|
| `matching:progress` | `{ jobId, progress, currentStep, status }` |
| `matching:complete` | `{ jobId, match: { ... } }` |
| `matching:failed` | `{ jobId, error, errorCode }` |

Frontend **polls** matching jobs today; WebSocket matching is optional but recommended.

---

## 5. Error codes the frontend handles

| Code | When | HTTP |
|------|------|------|
| `NO_ENROLLED_STUDENTS` | No peers for selected course | 200/202 with `status: waiting` or failed job |
| `ALREADY_IN_GROUP` | User already in a pod for that course | 409 |
| `VALIDATION_ERROR` | Bad onboarding/matching body | 400 |
| `FORBIDDEN` | Not a group member | 403 |
| `NOT_FOUND` | Group/user/resource missing | 404 |

Always include `error.message` for display.

---

## 6. Implementation priority

| Priority | Work item |
|----------|-----------|
| P0 | `POST /matching/find-group` with explicit `course`; waiting + completed responses; auto `group_members` on match |
| P0 | `GET /users/me/groups` with correct shape for dashboard + `/workspace` |
| P0 | `GET /workspaces/:groupId` with `members[]` |
| P0 | `POST/GET /onboarding/profile` with **multiple courses**; first-time save from Find Groups |
| P1 | `GET /matching/course/:courseCode` |
| P1 | `GET /matching/jobs/:jobId` with `progress`, `currentStep`, `match`, `waiting` |
| P1 | `PATCH /tasks/:taskId` with `status` + `position` for kanban drag |
| P1 | Chat + files + sessions GET/POST with shapes above |
| P2 | `GET /users/:userId/profile` (pod-scoped) |
| P2 | `DELETE` messages/files; `PATCH/DELETE` sessions |
| P2 | `PUT /tasks/reorder` (optimization) |
| P2 | WebSocket workspace + matching events |

---

## 7. How to verify against the frontend

1. Set frontend `.env`:
   ```env
   VITE_API_BASE_URL=https://your-api.onrender.com/api
   VITE_WS_URL=https://your-api.onrender.com
   ```
2. Test script:
   - Register → complete or skip onboarding
   - `/find-groups` → add/select course → Search for a pod
   - Match found → Join → `/workspace/:groupId` (board, chat, files, calendar)
   - `/workspace` lists all pods
   - Click member avatar in chat → profile modal
   - Dashboard shows same pods as `/workspace`

---

## 8. Questions for backend to confirm

1. Does `POST /matching/find-group` **automatically** add the user to the group, or must the frontend call `POST /matching/groups/:groupId/join` after match?
2. Can a user be in **multiple courses** simultaneously (one pod per course)? Frontend assumes yes.
3. For skipped onboarding: is it acceptable to create onboarding profile with server-side defaults on first `POST` from Find Groups?

---

*Document version: matches frontend as of course-select Find Groups flow, workspace pod list, and member profile modal.*
