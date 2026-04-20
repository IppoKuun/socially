import { QueryClient } from "@tanstack/react-query";
//lib/queryClients//

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // Pendant 30 Sec mes données sont considérées comme fraiche et sont gardé en cache //
        gcTime: 5 * 60_000, // Si personne utilise pdt 5 min le cache, il est effacé de tout naviguateur //
        retry: 1,
      },
    },
  });
}
