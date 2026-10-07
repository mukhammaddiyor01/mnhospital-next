# Hospital frontend API coverage

The offline contract check compares frontend GraphQL documents and workspace form operations with the schema exported from the backend resolver classes. It checks field names, arguments and selections. It does not prove that every database workflow has been exercised with live accounts.

## Role routes

| Role | Connected sections |
| --- | --- |
| Admin | `/admin`: patients and accounts, doctors, receptionists, services, advertisements, articles, notices, comments, bookings, appointments, payments, rooms, reception tasks, messages, notifications and admin details |
| Doctor | `/doctor-workspace`: appointments, services, articles, departments, schedule, medical reports, profile, messages and notifications |
| Receptionist | `/receptionist-workspace`: assigned appointments, bookings, payments, reception tasks, reports, profile, messages and notifications |
| Patient | `/mypage`: profile, cart, bookings, payments, appointments, own reports, messaging, notifications and preferences |

Doctor schedules use the existing `upsertMyDoctorSchedule` contract. Doctor and patient private details remain owner scoped. Reception appointment reads are restricted to active assigned tasks. Admin doctor profile management exposes the status mutation that actually exists in the backend.

## Verification

Generate the backend schema with `node scripts/export-workspace-schema.cjs /tmp/mn-workspace-schema.graphql` in the backend repository. Run `node scripts/verify-workspace-contracts.cjs /tmp/mn-workspace-schema.graphql <backend-node_modules-path>` in the frontend repository. The generated JSON lists individual fields; `checkAuth` and `checkAuthRoles` are internal diagnostics.

Both application builds and focused booking, payment, appointment, room, role and ownership tests were checked during implementation. Provider checkout is separate from contract verification: Eximbay requires the hospital merchant configuration and a provider test transaction before production use. No financial transaction was executed during this implementation.

Chat controls have their own normal-flow space below the header; they do not float over homepage content or bottom navigation. Public doctor lists use real API records and show truthful empty/error states. Existing advertisement rails and carousel animations remain.
