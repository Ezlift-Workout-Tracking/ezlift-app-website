# Backend Improvement Opportunities

## Post-MVP Backend Enhancements

**These are NOT required for MVP but will improve Phase 2:**

**1. Aggregation Endpoints** (Reduce client-side computation):
```
GET /api/stats/weekly-volume?startDate={date}&endDate={date}
  → Returns pre-computed weekly volume (faster than client-side)

GET /api/stats/personal-records?limit={n}
  → Returns top PRs (no need to fetch all sessions)

GET /api/stats/progress/:exerciseId?weeks={n}
  → Returns progression data for specific exercise
```

**2. Bulk Import Endpoint**:
```
POST /workout-log/bulk
  → Accept array of sessions (faster than one-by-one)
  → Return success count + failures
```

**3. Session Filtering** (Phase 2 Enhancement):
```
⚠️ CURRENT LIMITATION: /workout-log endpoint does not support filtering parameters.
Frontend must fetch all sessions and filter client-side.

**Future Enhancement**:
```
GET /workout-log?exerciseId={id}&startDate={date}&endDate={date}
  → Filter sessions by exercise and date range (for progress charts)
```

**4. Dashboard Summary Endpoint**:
```
GET /api/dashboard/summary?range={days}
  → Returns all dashboard card data in one request
  → Reduces round trips (5 requests → 1 request)
```

**5. Exercise Name Availability in Session Logs** (Discovered 2025‑10‑13):

- Issue: Mobile/web logs often contain only `exerciseId`. Web needs the display name for UX.
- Current mitigation: Frontend enriches by calling `/api/exercise/{id}` per unique id and caching results.
- Recommended improvements:
  1) Include `exerciseName` alongside `exerciseId` in `/api/workout-log` responses.
  2) Provide a bulk lookup: `GET /api/exercise/bulk?ids=...` to resolve multiple ids in one round trip.
  3) Standardize field names in session payloads (prefer: `logs[].exerciseId`, `logs[].name`, `logs[].sets[]`, `sets[].reps`, `sets[].weight`).
  4) Document response shape formally to avoid client‑side normalization logic.

Benefits:
- Fewer network calls on dashboard load, simpler clients, and less coupling to backend shape quirks.

## Backend vs Client-Side Tradeoffs

**Compute Client-Side When**:
- ✅ Flexible UI requirements (frequent changes)
- ✅ Low data volume (< 1000 records)
- ✅ Complex filtering (easier in JavaScript than SQL)
- ✅ MVP speed (no backend changes needed)

**Compute Server-Side When**:
- ✅ Large data volumes (> 10,000 records)
- ✅ Complex aggregations (multi-join queries)
- ✅ Performance critical (sub-100ms response)
- ✅ Shared across platforms (web + mobile + future)

---
