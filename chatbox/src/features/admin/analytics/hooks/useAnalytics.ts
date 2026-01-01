import { useEffect, useState } from "react";
import { analyticsApi } from "../api/analytics.api";
import type { Overview, Category, HourActivity } from "../types/analytics.types";

export const useAnalytics = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hourly, setHourly] = useState<HourActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, categoriesRes, hourlyRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getCategories(),
        analyticsApi.getHourlyActivity(),
      ]);

      const o = overviewRes.data;
      const total = o.totalChats || 0;
      const resolved = o.resolvedChats || 0;

      setOverview({
        ...o,
        unresolvedChats: total - resolved,
        resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
      });

      setCategories(categoriesRes.data.categories || []);

      const sorted = (hourlyRes.data.hourlyActivity || []).sort(
        (a: HourActivity, b: HourActivity) => {
          const hA = parseInt(a.hour);
          const hB = parseInt(b.hour);
          return hA - hB;
        }
      );

      setHourly(sorted);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    overview,
    categories,
    hourly,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
