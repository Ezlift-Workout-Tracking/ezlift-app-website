# Goals and Background Context

## Product Goals
- Deliver secure web app MVP dashboard and history without regressing existing site flows
- Establish import entry (Hevy/Strong CSV early access) to validate portability demand
- Enable new users to create programs on web with full desktop advantages
- Provide existing users with powerful analytics and data visualization
- Maintain Core Web Vitals targets (LCP < 2.5s p75, INP < 200ms p75)
- Instrument comprehensive analytics to inform product decisions

## Background
Public site + secure companion app; reuse backend + Firebase auth with server sessions; content via Contentful; exercise data via Postgres and S3 media. This enhancement builds incrementally atop existing architecture while preserving current behavior.

**Desktop Advantages**: Large screens enable sophisticated program building, data visualization, and multi-column layouts that mobile can't provide. Web app complements mobile (planning/analytics) rather than duplicating it (live tracking).

