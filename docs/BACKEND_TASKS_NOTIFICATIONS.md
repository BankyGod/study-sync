# StudySync — Kanban Tasks & Notifications (Backend Spec)

**Audience:** Backend developers  
**Frontend:** User will implement UI (delete, assignee progress buttons, regress confirmation, notification bell). This doc is the contract.  
**Related:** [`BACKEND_HANDOFF.md`](./BACKEND_HANDOFF.md), [`BACKEND_API_SPEC.md`](./BACKEND_API_SPEC.md)

---

## 1. Goals

1. **Creator can delete** their own task cards.
2. **Assignee-driven progress** — assignee marks *Started* → task moves to `in_progress`; marks *Done* → `completed` (no manual drag required for those transitions).
3. **Backward moves are guarded** — dragging or requesting a move to an earlier column creates a **regress request**; the **task creator** is notified and must approve before the column changes.
4. **Notifications** — mix of **targeted** (specific users) and **broadcast** (all pod members), delivered via REST + WebSocket.

---

## 2. Column order & terminology

| Order | `status` value   | UI column    |
|-------|------------------|--------------|
| 0     | `todo`           | To Do        |
| 1     | `in_progress`    | In Progress  |
| 2     | `completed`      | Completed    |

- **Forward move:** target column index **greater** than current (e.g. `todo` → `in_progress`).
- **Regress (backward move):** target column index **less** than current (e.g. `completed` → `in_progress` or `todo`).

---

## 3. Data model

### 3.1 `tasks` (extend existing)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| group_id | UUID | |
| title | string | |
| status | enum | `todo`, `in_progress`, `completed` |
| variant | enum | `default`, `highlight`, `completed` |
| due_date | date? | `YYYY-MM-DD` |
| position | int | order within column |
| assignee_id | UUID? | FK → users |
| **created_by_id** | UUID | FK → users — **required**; set from JWT on POST |
| **started_at** | timestamp? | set when assignee marks started |
| completed_at | date? | ISO date when status = `completed` |
| created_at | timestamp | |
| updated_at | timestamp | |

**Task JSON (camelCase in API):** include on every task object:

```json
{
  "id": "uuid",
  "title": "Review Chapter 3",
  "status": "in_progress",
  "variant": "default",
  "dueDate": "2024-10-20",
  "position": 0,
  "startedAt": "2024-10-12T14:30:00.000Z",
  "completedAt": null,
  "createdAt": "2024-10-12T09:00:00.000Z",
  "createdBy": {
    "id": "uuid",
    "name": "Sam",
    "initials": "SM",
    "color": "bg-violet-500"
  },
  "assignee": {
    "id": "uuid",
    "name": "Alex",
    "initials": "AO",
    "color": "bg-sky-500"
  },
  "pendingRegressRequest": null
}
```

When a regress request is open, `pendingRegressRequest`:

```json
{
  "id": "uuid",
  "fromStatus": "completed",
  "targetStatus": "in_progress",
  "reason": "Need to fix mistakes",
  "requestedAt": "2024-10-13T10:00:00.000Z",
  "requestedBy": {
    "id": "uuid",
    "name": "Jordan",
    "initials": "JO",
    "color": "bg-emerald-500"
  }
}
```

### 3.2 `task_regress_requests`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| task_id | UUID | FK → tasks |
| group_id | UUID | denormalized for queries |
| requested_by_id | UUID | FK → users |
| from_status | enum | snapshot at request time |
| target_status | enum | must be earlier than `from_status` |
| reason | text? | optional message from requester |
| status | enum | `pending`, `approved`, `rejected`, `cancelled` |
| resolved_by_id | UUID? | creator who approved/rejected |
| resolved_at | timestamp? | |
| created_at | timestamp | |

**Rule:** at most **one** `pending` request per task. New request while pending → `409` `REGRESS_REQUEST_ALREADY_PENDING`.

### 3.3 `notifications`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| user_id | UUID | recipient |
| group_id | UUID? | pod context for deep links |
| type | string | see §6 |
| title | string | short line for UI |
| body | string? | longer text |
| data | jsonb | machine-readable payload (taskId, requestId, actorId, etc.) |
| read_at | timestamp? | null = unread |
| created_at | timestamp | |

**Indexes:** `(user_id, created_at DESC)`, `(user_id, read_at)` where `read_at IS NULL`.

---

## 4. Authorization rules

| Action | Who |
|--------|-----|
| Create task | Any group member |
| Update title/dueDate/assignee | Any group member (optional: restrict to creator — not required for v1) |
| **Delete task** | **`created_by_id` only** (or group admin if you add roles later) |
| Drag forward / reorder within same column | Any group member |
| **Assignee progress** (`start`, `complete`) | **Current `assignee_id` only** (403 if unassigned) |
| **Request regress** | Any group member |
| **Approve / reject regress** | **Task creator (`created_by_id`) only** |
| Cancel own pending regress request | Requester only |

All routes: verify JWT + membership in `group_id`. Return `403 FORBIDDEN` with `{ "error": { "code": "FORBIDDEN", "message": "..." } }`.

---

## 5. Task API

Base path: `/api/workspaces/:groupId/tasks`

### 5.1 `GET /tasks` — unchanged shape

Still returns `{ todo, in_progress, completed }` arrays. Each task includes `createdBy`, `startedAt`, `pendingRegressRequest` as above.

### 5.2 `POST /tasks` — set creator

**Request:** (unchanged)

```json
{ "title": "New task", "dueDate": "2024-10-22", "assigneeId": "uuid" }
```

**Server:** set `created_by_id` from JWT. Status `todo`, `position` = end of column.

**Notifications (see §6):** if `assigneeId` present → `task.assigned` to assignee.

**WebSocket:** `task:created` to `workspace:{groupId}`.

### 5.3 `PATCH /tasks/:taskId` — constrained moves

**Allowed without regress flow:**

- Edit metadata: `title`, `dueDate`, `assigneeId`, `variant`
- **Forward** status change: `todo` → `in_progress` → `completed` (when caller is any member)
- Reorder: `position` with **same** `status`
- Assignee change → notify new assignee (`task.assigned`); optionally notify previous assignee (`task.unassigned`)

**Blocked (use regress flow instead):**

- Any change where `targetStatus` order **<** current status order → **`409`**:

```json
{
  "error": {
    "code": "REGRESS_REQUIRES_APPROVAL",
    "message": "Moving this task backward requires creator approval.",
    "details": {
      "currentStatus": "completed",
      "targetStatus": "in_progress",
      "regressRequestUrl": "/api/workspaces/{groupId}/tasks/{taskId}/regress-requests"
    }
  }
}
```

**While `pendingRegressRequest` exists:**

- Reject PATCH that changes `status` (except approve endpoint) → `409` `TASK_STATUS_LOCKED`.

**On forward move to `completed`:** set `completedAt` (today), `variant` → `completed`.  
**On forward move to `in_progress` from `todo`:** may set `startedAt` if not already set (optional convenience).

**WebSocket:** `task:updated`.

### 5.4 `DELETE /tasks/:taskId` — creator only

**Auth:** `created_by_id === current user` else `403` `NOT_TASK_CREATOR`.

**Response:** `204`.

**Notifications:**

- If task had assignee → `task.deleted` to assignee (targeted)
- Optional: `task.deleted` to creator (skip — they initiated)

**WebSocket:** `task:deleted` `{ groupId, taskId }`.

### 5.5 `POST /tasks/:taskId/progress` — assignee actions

Dedicated endpoint for assignee *Started* / *Done* buttons (frontend will call this instead of raw PATCH for those actions).

**Request:**

```json
{ "action": "start" }
```

or

```json
{ "action": "complete" }
```

| action | Effect | Preconditions |
|--------|--------|---------------|
| `start` | `status` → `in_progress`, set `startedAt` = now | assignee only; allowed from `todo` or already `in_progress` (idempotent) |
| `complete` | `status` → `completed`, set `completedAt`, `variant` → `completed` | assignee only; allowed from `todo` or `in_progress` |

**Response `200`:** full updated task object.

**Errors:**

| Code | When |
|------|------|
| `NOT_ASSIGNEE` | caller ≠ assignee |
| `NO_ASSIGNEE` | task has no assignee |
| `INVALID_PROGRESS_ACTION` | e.g. `complete` when already completed |

**Notifications:**

| action | Recipients |
|--------|------------|
| `start` | all current assignees (see §6.1) **except** the actor |
| `complete` | all current assignees **except** the actor |

Also notify **creator** on `complete` (recommended): `task.completed` to creator.

**WebSocket:** `task:updated`.

### 5.6 Regress request flow

#### `POST /tasks/:taskId/regress-requests`

**Request:**

```json
{
  "targetStatus": "in_progress",
  "reason": "Found errors in the submission"
}
```

**Validation:**

- `targetStatus` must be strictly earlier than current task status.
- No existing `pending` request on this task.

**Response `201`:**

```json
{
  "request": {
    "id": "uuid",
    "taskId": "uuid",
    "fromStatus": "completed",
    "targetStatus": "in_progress",
    "reason": "Found errors in the submission",
    "status": "pending",
    "requestedAt": "2024-10-13T10:00:00.000Z",
    "requestedBy": { "id": "...", "name": "...", "initials": "...", "color": "..." }
  },
  "task": { "...": "task with pendingRegressRequest populated" }
}
```

**Notifications:** `task.regress_requested` → **task creator only**.

**WebSocket:**

- `task:updated` (task now shows `pendingRegressRequest`)
- `notification:new` to creator's `user:{userId}` room

#### `POST /tasks/:taskId/regress-requests/:requestId/approve`

**Auth:** creator only.

**Effect:**

- Set request `status` → `approved`
- Move task to `targetStatus`; clear `completedAt` / adjust `startedAt` as needed
- Clear `pendingRegressRequest` on task

**Response `200`:** `{ request, task }`

**Notifications:** `task.regress_approved` → **all group members** (broadcast).

**WebSocket:** `task:updated` to workspace; `notification:new` to each member.

#### `POST /tasks/:taskId/regress-requests/:requestId/reject`

**Auth:** creator only.

**Request body (optional):**

```json
{ "message": "Task was reviewed; keep as completed" }
```

**Effect:** request → `rejected`; task status unchanged; clear pending on task.

**Notifications:**

- `task.regress_rejected` → **requester** (targeted)

**WebSocket:** `task:updated`; `notification:new` to requester.

#### `DELETE /tasks/:taskId/regress-requests/:requestId`

**Auth:** requester only, while `pending`.

**Effect:** `cancelled`; clear pending on task.

**Response:** `204`. No notifications required.

### 5.7 Bulk reorder — `PUT /tasks/reorder` (optional)

Unchanged from existing spec. **Regress in bulk payload** must follow same rules (reject or split into regress requests per task). Simplest v1: reject entire reorder if any item regresses → `REGRESS_REQUIRES_APPROVAL`.

---

## 6. Notification types & recipients

### 6.1 Recipient scopes

| Scope | Meaning |
|-------|---------|
| `assignees` | All users on `task.assignee_id` (v1: single assignee; design supports array later) |
| `creator` | `task.created_by_id` |
| `requester` | User who opened the regress request |
| `group` | Every `group_members` row for `group_id` |
| `actor_exclude` | When notifying assignees, do **not** notify the user who performed the action |

### 6.2 Event matrix

| type | When | Recipients | title example |
|------|------|------------|---------------|
| `task.assigned` | POST task or PATCH `assigneeId` | new assignee | "You were assigned a task" |
| `task.unassigned` | PATCH clears/changes assignee | previous assignee (optional) | "You were unassigned from a task" |
| `task.progress_started` | POST `progress` action `start` | assignees − actor; optional creator | "Task started" |
| `task.completed` | POST `progress` action `complete` | assignees − actor; **creator** | "Task completed" |
| `task.regress_requested` | POST regress-requests | **creator** | "Move-back requested on your task" |
| `task.regress_approved` | creator approves | **all group members** | "Task moved back to In Progress" |
| `task.regress_rejected` | creator rejects | **requester** | "Move-back request declined" |
| `task.deleted` | DELETE task | assignee (if any) | "Task deleted" |

### 6.3 `data` payload (consistent keys)

```json
{
  "groupId": "biology-101",
  "taskId": "uuid",
  "taskTitle": "Review Chapter 3",
  "actorId": "uuid",
  "actorName": "Alex",
  "requestId": "uuid",
  "fromStatus": "completed",
  "targetStatus": "in_progress"
}
```

Frontend uses `groupId` + `taskId` to deep-link to `/workspace/:groupId/board`.

---

## 7. Notifications REST API

Base: `/api/users/me/notifications`

### 7.1 `GET /users/me/notifications`

**Query:**

| Param | Type | Default |
|-------|------|---------|
| `limit` | int | 20, max 50 |
| `cursor` | string | opaque pagination cursor |
| `unreadOnly` | boolean | false |
| `groupId` | string | filter by pod |

**Response `200`:**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "task.regress_requested",
      "title": "Move-back requested on your task",
      "body": "Jordan asked to move \"Review Chapter 3\" back to In Progress",
      "groupId": "biology-101",
      "readAt": null,
      "createdAt": "2024-10-13T10:00:00.000Z",
      "data": {
        "groupId": "biology-101",
        "taskId": "uuid",
        "taskTitle": "Review Chapter 3",
        "requestId": "uuid",
        "actorId": "uuid",
        "fromStatus": "completed",
        "targetStatus": "in_progress"
      }
    }
  ],
  "nextCursor": "eyJ...",
  "unreadCount": 3
}
```

### 7.2 `GET /users/me/notifications/unread-count`

**Response `200`:** `{ "unreadCount": 3 }`

Lightweight poll for navbar badge.

### 7.3 `PATCH /users/me/notifications/:notificationId/read`

**Response `200`:** `{ "id": "uuid", "readAt": "2024-10-13T11:00:00.000Z" }`

Only the owning user. Others' IDs → `404`.

### 7.4 `POST /users/me/notifications/read-all`

**Request (optional):** `{ "groupId": "biology-101" }` — if omitted, mark all read.

**Response `200`:** `{ "markedCount": 12 }`

---

## 8. WebSocket

### 8.1 Rooms (existing + required)

| Room | Purpose |
|------|---------|
| `user:{userId}` | Personal notifications, matching |
| `workspace:{groupId}` | Task/chat collaboration |

On socket connect with valid JWT, **auto-join** `user:{userId}`.

### 8.2 New server → client events

| Event | Room | Payload |
|-------|------|---------|
| `notification:new` | `user:{userId}` | `{ notification }` — same shape as REST item |
| `notification:read` | `user:{userId}` | `{ notificationId, readAt }` — optional sync across tabs |

Existing task events unchanged: `task:created`, `task:updated`, `task:deleted`.

### 8.3 Notification delivery algorithm

```text
createNotification({ type, recipients, title, body, data, groupId })
  for each userId in recipients:
    INSERT notifications row
    EMIT notification:new to user:{userId}
```

For `group` scope: `SELECT user_id FROM group_members WHERE group_id = ?`.

**Do not** emit `notification:new` to `workspace:{groupId}` — per-user delivery only (avoids leaking read state).

---

## 9. Error codes (additions)

| code | HTTP | When |
|------|------|------|
| `NOT_TASK_CREATOR` | 403 | DELETE or approve/reject regress by non-creator |
| `NOT_ASSIGNEE` | 403 | progress action by non-assignee |
| `NO_ASSIGNEE` | 400 | progress on unassigned task |
| `REGRESS_REQUIRES_APPROVAL` | 409 | PATCH/reorder tries backward move |
| `REGRESS_REQUEST_ALREADY_PENDING` | 409 | second pending request |
| `TASK_STATUS_LOCKED` | 409 | status change while regress pending |
| `INVALID_REGRESS_TARGET` | 400 | target not earlier than current |
| `INVALID_PROGRESS_ACTION` | 400 | bad `action` value |

---

## 10. Implementation priority

| Priority | Item |
|----------|------|
| P0 | `created_by_id` on tasks; creator-only DELETE |
| P0 | `POST /tasks/:taskId/progress` with notifications to assignees |
| P0 | Block backward PATCH; regress request + approve/reject |
| P0 | `notifications` table + GET/PATCH read + unread count |
| P0 | `notification:new` on `user:{userId}` |
| P1 | `task.regress_approved` broadcast to full group |
| P1 | `pendingRegressRequest` on task GET responses |
| P2 | Notification pagination cursors; `read-all` |
| P2 | `task.unassigned` notifications |

---

## 11. Frontend integration notes (for backend awareness)

The frontend will:

1. Show **Delete** on task card when `task.createdBy.id === currentUser.id`.
2. Show **Started** / **Done** for assignee when `task.assignee.id === currentUser.id` → `POST .../progress`.
3. On drag to earlier column → call `POST .../regress-requests` (not PATCH); show toast "Waiting for creator approval".
4. Creator sees approve/reject on card or notification click.
5. Navbar bell → `GET /users/me/notifications` + `notification:new` over socket.

**Drag forward** can remain `PATCH` with `{ status, position }` or bulk reorder.

---

## 12. Example sequences

### Assignee completes task

```text
POST /workspaces/g1/tasks/t1/progress  { "action": "complete" }
  → task.status = completed
  → NOTIFY assignees (except actor), creator
  → WS task:updated → workspace:g1
  → WS notification:new → user:{each recipient}
```

### Member drags completed → in progress

```text
PATCH /workspaces/g1/tasks/t1  { "status": "in_progress" }
  → 409 REGRESS_REQUIRES_APPROVAL

POST /workspaces/g1/tasks/t1/regress-requests  { "targetStatus": "in_progress", "reason": "..." }
  → NOTIFY creator
  → WS task:updated (pendingRegressRequest set)

POST /workspaces/g1/tasks/t1/regress-requests/r1/approve   (creator)
  → task moved; pending cleared
  → NOTIFY all group members
  → WS task:updated + notification:new × N
```

---

*Document version: Kanban regress approval + notifications — backend contract for frontend implementation.*
