# Mobile privacy boundaries

Public catalog: services, public doctor profiles and published articles, with their images, are fetched anonymously. No patient ID, token, location, contact, or device identifier is included. The current app does not collect analytics or request camera, microphone, location, contacts, or notification permission.

Future private features need an explicit data inventory before implementation: field names, purpose, verified owner/role, server retention, device retention, screen visibility, logs, notifications, exports, and account deletion behavior. Keep clinical records in authorized server responses and transient screen state unless an offline-use requirement is approved and designed. Never use general local storage for passwords, JWTs, refresh credentials, or medical data. SecureStore is for credentials after the native session contract is verified; it is not a clinical-record store.

On logout or account switch, clear the matching credential and all owned private query/state caches, cancel or ignore in-flight responses from the old identity, and hide private screens. A network failure must not silently display a previous account's data. Notifications, previews, analytics, crash reports, and support messages must omit clinical details and patient identity. Review any third-party SDK's data collection before adding it.

This file describes engineering controls, not a legal privacy policy. Clinic-approved retention, consent, deletion, contact, and jurisdictional text must be supplied and reviewed before public launch. See `SECURITY.md` and `BACKEND_CONTRACT.md` for session and authorization boundaries.
