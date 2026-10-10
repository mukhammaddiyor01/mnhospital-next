# MN Hospital interface foundation

The shared presentation contract is in `scss/design-system.scss`, imported after the existing clinical and workspace styles. It preserves the current backend flows while giving public pages, patient account controls, and staff workspaces the same type scale, spacing, control dimensions, and card geometry.

## Layout and components

- Keep the patient canvas around 820px, with backend-driven advertisement rails on wide screens. Hide the rails below 1120px.
- Use 15px body text, 13–14px controls and supporting copy, and 11–12px secondary labels. Icons retain their own font.
- Cards use `--mn-radius: 16px`; controls use `--mn-control-radius: 10px`, with a minimum height of 44px for primary actions.
- Public light and dark surfaces use `--mn-card` and the existing `--clinical-*` tokens. Doctor, receptionist, and admin workspaces keep their respective clinical teal, slate-blue, and navy palettes.
- The public bottom navigation stays centered. Chat controls sit beside it on wide screens and in their own sticky row below the header on smaller screens.
- Mobile staff navigation expands from a labelled button, closes on navigation or Escape, and restores focus to its toggle on Escape.

## Profile components

`AccountProfileEditor` and `StaffProfileCard` supply a complete surface/token fallback for all four roles, including the patient account editor embedded in the patient portal. Personal information, hospital-managed doctor assignments, editing, and account security are separate sections.

Password controls use a native disclosure. Save is disabled until editable values change; existing upload, mutation, password, and session-ownership logic is retained. New copy is translated through the EN/UZ/KR workspace dictionary.

## Verification

- Production build and TypeScript validation.
- Existing authentication session regression checks.
- Public homepage, service directory, appointment form, and doctor sign-in checked visually at desktop and 390px mobile widths.
- Service page checked in light and dark themes, including horizontal-overflow checks.
- Four role profile layouts checked with local sample data. Edit/Cancel, unchanged Save, changed Save availability, password disclosure, and mobile navigation were checked without submitting profile or password changes.

The temporary sample-profile route used for verification is excluded from delivery. Live authenticated profile writes were not exercised by this presentation update.

## Profile connections and Core Departments

Following/follower buttons use the existing public follow queries and aggregate totals. Following combines patient and doctor targets; row identity is role plus profile ID. A native modal shows public avatars and full names, supports Escape/focus restoration, loads more relations, and distinguishes empty lists from failed requests. Doctor self-profile uses the doctor follower API; patient self-profile keeps its existing follow section. No follow feature is added to receptionist/admin roles.

Core Departments remains the existing service-backed carousel. Images resolve `serviceImages`, with a generic hospital placeholder when absent; counters display stored `serviceLikes` and `serviceViews` without executing like/view mutations. Preview entries are labelled and show unknown engagement rather than fabricated statistics.

Verification: `node scripts/verify-profile-presentation.cjs` checks 20 presentation/contract cases. Local sample UI checks covered desktop/mobile lists, mixed patient/doctor identities, load more, Escape/focus restoration, empty/error/retry states, and mobile overflow. Read-only live GraphQL checks confirmed service image/like/view fields and doctor follower/full-name/avatar/total responses. The temporary sample route is not delivered, and no live profile/follow/like writes were performed.

## Account record redesign

Using the owner's requested Anthropic `frontend-design` skill, My Profile now opens with a compact page title and an account identity header. Relationships sit alongside the account name, followed by section navigation and readable personal-information rows. Patient medical data remains a distinct owner-scoped patient record; birth date, gender, address, and notes are now visible in its read view using fields already returned by the existing query. Account contacts no longer repeat inside the completed medical record.

Care links retain their original routes in a two-column list; activity follows in separate recent/liked lists, and sign-out has its own quiet footer. Account security remains a native disclosure. Staff profiles share the identity/ledger layout and retain their role palettes and hospital-managed doctor assignments. Presentation rules live in `scss/profile-record.scss` and are isolated from catalog/booking styles.

Verification: 39 read-only presentation checks, including role separation and retained security/assignment controls. The sample-only browser fixture covered patient account Edit/Cancel and changed/unchanged Save states, medical Edit/Cancel and every original form field, header followers, section anchors, 390px mobile overflow, light/dark patient layouts, and doctor/receptionist/admin records. Password controls were expanded only; no credentials were entered. No profile, medical, password, follow, or like mutation was submitted. The sample fixture is excluded from the final build.
