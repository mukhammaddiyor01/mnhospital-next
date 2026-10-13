# MN Hospital expert review — 2026-10-13

Reviewed the deployed HTTP website at `http://76.13.242.85:2002/` (release 28d130d), public desktop homepage/services/visit guide and the repository's current implementation and verification evidence. Scores are professional judgement, not a certification, hiring guarantee or measured performance benchmark. This review does not claim a fresh end-to-end test of every private role or a penetration/load test.

| Area | Score / 10 | Evidence and remaining issue |
| --- | --- | --- |
| Desktop presentation | 6.5 | Cohesive clinical palette and hero. At a 1280px viewport the centre is 785px with two 216px advertisement rails; the fixed bottom navigation and large cards retain a mobile-app impression. |
| User experience | 6.5 | Real service filtering and doctor pagination, explicit booking steps and price review. Theme/language retain a double focus ring after pointer selection. Deployed service cards measure 652px high at 228px wide. |
| Business logic | 8 | Separate role profiles, sessions, room/schedule/break availability and server-owned payment rules. This score uses previously verified implementation evidence; live paid checkout was not executed. |
| Korean market fit | 6 | KR language, KRW/Asia-Seoul and Korean visit guide now present. Service titles/descriptions and advertisements remain English when KR is selected. Precise arrival/map/contact information and clinic-approved privacy/refund/insurance instructions are incomplete. |
| Production readiness | 5 | Healthy Docker release, identifiable SHA, locked dependencies and security headers are an improvement. Public traffic remains HTTP, so Secure refresh cookies and HTTPS-dependent OAuth cannot provide their intended production experience. Remote CI, TLS renewal, monitoring/backups and payment activation need operating evidence. |
| Full-stack portfolio | 8 | Real GraphQL/Nest/Mongo workflows, role boundaries, meaningful auth/booking tests and deployment documentation show engineering depth. A concise Korean case study with problem, design decision, test evidence and measured performance would improve reviewability. |

The overall public product is roughly **6.5/10** today. Its engineering portfolio is stronger than its commercial clinic presentation.

## Korean benchmark
Samsung Medical Center publishes explicit appointment, arrival/preparation, billing/insurance and interpretation guidance. Asan Medical Center describes support throughout appointment, treatment, billing and administration. These are examples of patient-facing clarity to benchmark, not a requirement to copy a large hospital's infrastructure or promise their services. [Samsung outpatient guide](https://www.samsunghospital.com/en/international-healthcare-center/outpatient-services.do), [Samsung patient FAQ](https://www.samsunghospital.com/en/patient-guide/faq.do?searchText=), [Asan international care](https://eng.amc.seoul.kr/gb/lang/patients/contents/ourService.do).

For engineering hiring, Toss's current frontend description names React/Next.js/TypeScript, a shared design system, static analysis and automated tests; its platform role mentions Storybook/Playwright test environments. MN Hospital's stack and test evidence align with those examples. Showing ownership of one difficult failure and a reliable fix matters more than listing frameworks. Requirements differ by company and seniority. [Toss frontend role](https://toss.im/career/job-detail?job_id=4076141003), [Toss platform role](https://toss.im/career/job-detail?job_id=5130165003).

## Priorities with the established design retained
1. Complete pointer/keyboard preference focus handling and compact service cards. The current patch keeps the page layout, advertisements, mobile navigation, prices, likes and all booking rules.
2. Deploy an owned HTTPS domain; verify role-specific refresh after token expiry and OAuth callbacks. Preserve Secure/HttpOnly.
3. Replace demo-style medical/service text with clinic-reviewed Korean copy, verified location/phone and practical transport/check-in instructions. The database catalog requires approved content rather than invented translations or clinical claims.
4. Add actual business-approved privacy, cancellation/refund and insurance guidance. Do not imply compliance from a UI change.
5. Record CI results, API and frontend health monitoring, backup/restore evidence and measured Core Web Vitals. No Lighthouse/Core Web Vitals score has been invented in this review.
6. Present one Korean portfolio case study: session reload versus booking reset, schedule/room intersection or server-owned payment totals, with before/after behavior and tests.

## Follow-up patch verification
At the same desktop viewport, compact service cards measured 462px instead of the deployed 652px (about 29% shorter). Price/discount, doctor/duration, like action, details link and screen-reader labels remain available. Pointer-based theme/language selection releases focus; keyboard interaction retains one 2px outline around the control, with no inner outline. Verified light/dark, UZ text and a 390px mobile viewport without horizontal overflow. Production build, TypeScript, 8 preference-control checks, 70 palette contrast checks, 56 auth checks, 30 promotion checks and 37 service-booking-option checks passed. This patch requires a new server release before it changes the live-site scores above.
