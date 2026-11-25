# Business logic

The welcome screen has no clinical or booking behavior. Before implementing bookings, preserve backend rules for real service/doctor selection, schedule, room, break time, server-calculated price, payment ownership, and reservation expiry. Client checks improve usability but never grant access or establish final availability. The backend `ProjectLogic.md` and existing booking docs are the detailed source of truth.
