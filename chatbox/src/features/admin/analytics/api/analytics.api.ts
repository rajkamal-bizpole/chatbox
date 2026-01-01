// features/analytics/api/analytics.api.ts
import http from "../../../../api/http";

export const analyticsApi = {
  getOverview: () => http.get("/api/admin/analytics/overview"),
  getCategories: () =>
    http.get("/api/admin/analytics/popular-categories"),
  getHourlyActivity: () =>
    http.get("/api/admin/analytics/hourly-activity"),
};
