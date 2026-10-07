# Hospital frontend API coverage

The offline contract check compares frontend GraphQL documents and workspace form operations with the schema exported from the backend resolver classes. It checks field names, arguments and selections. It does not prove that every database workflow has been exercised with live accounts.

## Role routes

| Role | Connected sections |
| --- | --- |
| Admin | `/admin`: patients and accounts, doctors, receptionists, services, advertisements, articles, notices, comments, bookings, appointments, payments, rooms, reception tasks, messages, notifications and admin details |
| Doctor | `/doctor-workspace`: appointments, services, articles, departments, schedule, medical reports, profile, messages and notifications |
| Receptionist | `/receptionist-workspace`: assigned appointments, bookings, payments, reception tasks, reports, profile, messages and notifications |
| Patient | `/mypage`: profile, cart, bookings, payments, appointments, own reports, messaging, notifications and preferences |

Doctor schedules use the existing `upsertMyDoctorSchedule` contract. Doctor and patient private details remain owner scoped. Reception appointment reads are restricted to active assigned tasks. Admin doctor editing uses `updateDoctorByAdmin` for contact details, image, experience, specialty and ACTIVE/BLOCK status. Login credentials and the assigned office remain fixed. DELETE is the separate archive operation; archived doctor records cannot be edited.

## Verification

Generate the backend schema with `node scripts/export-workspace-schema.cjs /tmp/mn-workspace-schema.graphql` in the backend repository. Run `node scripts/verify-workspace-contracts.cjs /tmp/mn-workspace-schema.graphql <backend-node_modules-path>` in the frontend repository. The generated JSON lists individual fields; `checkAuth` and `checkAuthRoles` are internal diagnostics.

Both application builds and focused booking, payment, appointment, room, role and ownership tests were checked during implementation. Provider checkout is separate from contract verification: Eximbay requires the hospital merchant configuration and a provider test transaction before production use. No financial transaction was executed during this implementation.

Live chat and AI controls float at the lower right above the bottom navigation and stay available while the page scrolls. They are independent of the advertisement rail. Right advertisements keep their natural height without a chat-specific height limit or an inner scrollbar; longer cards scroll with the page. Smaller screens use compact floating controls. Public doctor lists use real API records and show truthful empty/error states. Existing advertisement data and carousel animations remain.

## Staff navigation

Staff sign-in opens the role dashboard. Its work links keep the staff shell: profile, messaging, notifications and management sections use the corresponding admin/doctor/receptionist workspace. Doctor dashboard profile actions open `/doctor-workspace/profile`, not the public directory detail. The staff sidebar has no client website exit link. Public doctor directory pages remain available to patients and guests.

## Doctor creation room choices

The admin doctor form loads `getAvailableDoctorRooms` as a required room-number dropdown. Occupied, inactive, maintenance and doctor-assigned rooms are excluded by the backend, including legacy assignments. Create stays visible in loading, unavailable and empty states. The form explains the room state and disables saving until an available room can be selected. The admin can refresh choices or manage rooms within the same workspace. Choices refresh after saving or deleting a doctor; readonly edits display the current saved room number. New doctors start ACTIVE; status can be changed after creation. Editing loads complete profile fields, supports clearing optional contact/image fields and refreshes the selected detail view.

Authentication now includes `refreshSession` and `logoutSession` alongside the existing role login APIs. Refresh uses a backend HttpOnly cookie; private API access verifies session revocation and current profile status. The browser link restores/rotates sessions and clears owned caches on logout or identity change. See AUTH_SESSIONS.md.
