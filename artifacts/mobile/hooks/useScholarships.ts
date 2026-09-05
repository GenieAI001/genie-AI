import { useQuery } from '@tanstack/react-query';
import { listScholarships } from '@workspace/api-client-react';
import { SCHOLARSHIPS as FALLBACK_SCHOLARSHIPS, type Scholarship } from '@/constants/scholarships';

/**
 * Scholarships now live in the database and are managed from the admin
 * dashboard (`artifacts/admin`), instead of being hardcoded here.
 *
 * If the API is unreachable (no EXPO_PUBLIC_API_BASE_URL set, network down,
 * etc.) this falls back to the bundled `SCHOLARSHIPS` list so the app still
 * works — just with whatever data shipped in the build.
 */
export function useScholarships() {
  const query = useQuery({
    queryKey: ['scholarships'],
    queryFn: async (): Promise<Scholarship[]> => {
      const rows = await listScholarships();
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        provider: r.provider,
        country: r.country,
        amount: r.amount,
        levels: r.levels,
        deadline: r.deadline,
        minCGPA: r.minCgpa,
        minIELTS: r.minIelts,
        tags: r.tags,
        description: r.description,
        fields: r.fields,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    scholarships: query.data ?? FALLBACK_SCHOLARSHIPS,
    isLive: query.isSuccess,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
