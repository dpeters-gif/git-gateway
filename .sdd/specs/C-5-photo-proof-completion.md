---
document: spec
title: "Photo Proof of Completion"
journey-id: "C-5"
version: 1.0.0
status: Draft
last-updated: "2026-03-30"
author: "PM + VEGA"
depends-on:
  - constitution.md
  - C-2-task-completion-xp.md
  - P-2-add-adjust-plans.md
related-entities:
  - Task
  - TaskCompletionPhoto
  - Notification
  - PointsLedger
---

# Photo Proof of Completion

## 1. Context

Parents assign tasks like "Zimmer aufräumen" (tidy room) but have
no way to verify completion without physically checking. Children
sometimes mark tasks as done prematurely. Photo proof adds trust
and accountability — the child snaps a photo of the result, the
parent sees it in the notification. This eliminates the "did you
really do it?" conversation.

## 2. Goal

When a parent marks a task as "photo required," the child must
capture a photo upon completion. The photo is visible to all adult
family members in the task detail and in the completion notification.

## 3. Non-Goals

- This journey does not implement video proof
- This journey does not implement AI verification of photos
- This journey does not implement photo editing or filters
- This journey does not block XP until parent approval — XP is
  awarded immediately (trust-based, with photo as evidence)

## 4. User Stories

- As a parent, I want to require a photo for certain tasks, so that
  I can see the result without physically checking.
- As a child, I want to take a quick photo when completing a task
  with photo proof, so that my parents see what I did.
- As a parent, I want to see the proof photo in the completion
  notification, so that I can verify the work.

## 5. Happy Path

**Starting state:** Parent has created a task "Zimmer aufräumen"
assigned to Dennis with photoRequired=true. Dennis is on the child
quest list.

| Step | Actor | Action | System Response | State After |
|------|-------|--------|-----------------|-------------|
| 1 | Dennis | Sees quest card | Card shows a camera icon indicator next to the completion checkbox, signaling photo proof is required. | Card visible |
| 2 | Dennis | Taps completion checkbox | Instead of immediately completing, system opens the camera capture UI: full-screen camera viewfinder with "Foto aufnehmen" / "Take photo" button. | Camera open |
| 3 | Dennis | Takes a photo | System shows photo preview with "Verwenden" / "Use" and "Nochmal" / "Retake" buttons. | Preview shown |
| 4 | Dennis | Taps "Verwenden" | System uploads photo, completes the task, awards XP. Standard completion animation plays (checkmark → XP pop → bar fill). | Task completed |
| 5 | System | Task completed | System creates notification for all adult family members: type=task_completed_with_photo, includes task title, child name, and photo thumbnail. | Parents notified |
| 6 | Parent | Taps notification | Navigates to task detail showing the proof photo, completion time, and XP awarded. | Photo visible |

## 6. Failure Paths

### 6.1 Camera permission denied
**Trigger:** Browser/device denies camera access.
**System response:** Message: "Kamera-Zugriff wird benötigt für das
Beweis-Foto. Bitte Berechtigung erteilen." / "Camera access needed
for proof photo. Please grant permission." Link to device settings.
Alternative: "Foto aus Galerie wählen" / "Choose from gallery" button.
**State after:** Task not completed until photo provided.

### 6.2 Photo upload fails
**Trigger:** Network error during photo upload.
**System response:** Photo stored locally. Retry button shown. Task
not marked complete until upload succeeds. Message: "Foto konnte
nicht hochgeladen werden — nochmal versuchen." / "Photo could not
be uploaded — try again."
**State after:** Photo pending upload. Task incomplete.

### 6.3 Child tries to complete without photo
**Trigger:** Task has photoRequired=true but child bypasses camera.
**System response:** Not possible — the completion flow opens camera
instead of direct completion. The checkbox tap always triggers camera
when photoRequired=true.

## 7. Edge Cases

### 7.1 Photo from gallery instead of camera
**Condition:** Child selects a pre-existing photo from the gallery.
**Expected behaviour:** Allowed. The system accepts gallery photos.
Parents can see the photo timestamp in the EXIF data (displayed as
"Foto aufgenommen: [time]" if available).

### 7.2 Multiple photo-proof tasks completed rapidly
**Condition:** Child completes 3 photo-proof tasks in quick succession.
**Expected behaviour:** Each opens the camera independently. Photos
uploaded sequentially. Each generates its own notification.

### 7.3 Task reassigned after photo requirement set
**Condition:** Parent changes assignee from Dennis to Lena.
**Expected behaviour:** Photo requirement stays. Lena sees the camera
icon on her quest card.

## 8. Rollback Path

**Failure point:** Task marked complete but photo upload fails.
**Rollback action:** Task completion is not committed until photo
upload succeeds. Both happen in the same request (multipart form
data: photo + completion).

## 9. Data Side Effects

| Step | Entity | Operation | Fields Affected |
|------|--------|-----------|-----------------|
| Parent enables photo | Task | Update | photoRequired=true |
| Child completes | Task | Update | status=completed, completedAt |
| Child uploads photo | TaskCompletionPhoto | Create | taskId, photoUrl, capturedAt |
| Child completes | PointsLedger | Create | XP entry |
| System notifies | Notification | Create | type=task_completed_with_photo |

## 10. Acceptance Criteria

### Functional Criteria

- **AC-001:** The system shall allow parents to toggle photoRequired
  on any task during creation or editing.
- **AC-002:** Where a task has photoRequired=true, the system shall
  display a camera icon on the task/quest card.
- **AC-003:** When a child taps complete on a photo-required task,
  the system shall open the camera capture UI instead of immediately
  completing the task.
- **AC-004:** The system shall allow the child to take a photo or
  select from the device gallery.
- **AC-005:** When the photo is accepted, the system shall upload the
  photo and complete the task in a single request.
- **AC-006:** The system shall display the proof photo in the task
  detail view, accessible to all adult family members.
- **AC-007:** The system shall create a notification for adult family
  members that includes a photo thumbnail.

### State Criteria

- **AC-010:** While the photo is uploading, the system shall show a
  progress indicator on the camera screen.
- **AC-011:** If photo upload fails, the system shall show an error
  with retry. The task shall remain incomplete.
- **AC-012:** If camera permission is denied, the system shall show
  a permission request message and a gallery fallback option.

### Storage Criteria

- **AC-020:** Photos shall be stored as compressed JPEG (max 1200px
  on longest edge, quality 80%).
- **AC-021:** Photos shall be stored in a server-accessible directory
  with a URL retrievable via the task detail API.
- **AC-022:** Photo URLs shall only be accessible to authenticated
  family members.

### Invariants

- **INV-001:** A photo-required task must not be completable without
  a photo — the API must reject completion requests without a photo
  attachment when photoRequired=true.
- **INV-002:** Photo proof must not block XP award — XP is awarded
  immediately upon completion with photo.
- **INV-003:** Photos must never be accessible to users outside the
  family.

## 11. Success Criteria

- 70% of "tidy room" type tasks use photo proof after feature launch.
- Parent-child conflicts about task completion decrease measurably.

## 12. Constraints (DO NOT List)

- DO NOT implement video capture
- DO NOT implement AI photo verification
- DO NOT implement photo approval workflow (parent must approve before
  XP) — XP is immediate, trust-based
- DO NOT implement photo editing, filters, or stickers
- DO NOT store full-resolution photos — compress to max 1200px
- DO NOT implement photo proof for routine-generated tasks automatically
  — parent must enable per-task or per-routine

## 13. Open Questions

(none)

---

## Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-03-30 | Initial spec — photo proof of completion | PM + VEGA |
