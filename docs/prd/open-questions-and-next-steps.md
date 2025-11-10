# Open Questions & Next Steps

## Open Questions
- ✅ **RESOLVED**: Backend Changes table writes (Option A confirmed)
- ✅ **RESOLVED**: User data state approach (new vs existing)
- ✅ **RESOLVED**: Client-side vs server-side aggregation (client-side for MVP)
- ⏳ Voice-to-text API for program description (GPT API or alternative?)
- ⏳ Netlify Experiments vs other A/B tool selection
- ⏳ Amplitude pricing tier verification (event volume limits)

## Next Steps

**Immediate**:
1. ✅ PRD refinement complete (v0.2)
2. ✅ **Shard PRD** into `docs/prd/` folder for easier navigation
3. ⏭️ **Shard Architecture** into `docs/architecture/web-app/` folder
4. ⏭️ **Story Creation**: Scrum Master creates detailed story files from Epic 1

**Pre-Development**:
5. Backend team formalizes Changes table writes in REST endpoints
6. Install new dependencies (React Query, PapaParse, MiniSearch, Amplitude)
7. Set up Amplitude account and API keys

**Development** (11 weeks):
- Weeks 1-2: Foundation (layout, navigation, user data state detection)
- Weeks 3-4: Dashboard cards (all 5 cards with client-side aggregation)
- Week 5: History page and profile management
- Week 6: CSV import flow
- Weeks 7-8: Program builder (new users only)
- Weeks 9-10: Onboarding (9-step flow with branching)
- Week 11: Analytics integration and polish

**Post-MVP**:
- Phase 2: WatermelonDB migration (4 weeks)
- Backend optimization: Aggregation endpoints
- Feature enhancements based on user feedback and analytics

