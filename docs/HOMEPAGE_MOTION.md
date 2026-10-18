# Homepage motion — 2026-10-18

The homepage retains the hospital API, published-article filter, doctor sorting, advertisement rails, service/promotion ordering and existing booking/detail links.

- Hero: one-image Swiper with deterministic clipped image fragments and depth motion inspired by the supplied Super Flow reference. Text and booking actions stay stationary. Autoplay has a pause/play control and respects reduced-motion preferences.
- Doctors: Material-style clipped portrait widths, based on the supplied reference. Public doctor photos, specialties, experience and doctor-specific booking links are retained. Missing photos retain name initials.
- Articles: coverflow Swiper, using the existing ArticleCard and like/detail actions. The homepage loads up to eight published articles rather than truncating them to three. Navigation and pagination are scoped to each Swiper.

Effects are integrated as local typed Swiper modules; the supplied bundled Swiper runtime, demo photos and analytics beacon are not installed. Existing Swiper 14 and project CSS remain the base. Layout breakpoints follow each carousel container rather than the whole viewport.

Verification: TypeScript, Next.js production build, 28 homepage regression checks, desktop and 390px mobile browser review. No horizontal mobile overflow or browser errors were observed. Motion controls and doctor/article navigation were exercised against the public catalog without modifying production records.
