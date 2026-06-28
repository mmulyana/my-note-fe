import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { request } from '../lib/api-client';

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiOptionsBase<TResponse> = {
  url: string;
  queryKey?: readonly unknown[];
  enabled?: boolean;
  autoRefetchOnWindowFocus?: boolean;
  staleTime?: number;
  gcTime?: number;
  headers?: Record<string, string>;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
};

type ApiQueryOptions<TResponse> = ApiOptionsBase<TResponse> & {
  method?: 'GET';
};

type ApiMutationOptions<TResponse, TBody> = ApiOptionsBase<TResponse> & {
  method: MutationMethod;
  body?: TBody;
};

function isMutation<TResponse, TBody>(
  options: ApiQueryOptions<TResponse> | ApiMutationOptions<TResponse, TBody>,
): options is ApiMutationOptions<TResponse, TBody> {
  return options.method !== undefined && options.method !== 'GET';
}

function urlToQueryKey(url: string): string[] {
  const [pathname, search] = url.split('?');
  return search ? [pathname, search] : [pathname];
}

export function useApi<TResponse>(
  options: ApiQueryOptions<TResponse>,
): UseQueryResult<TResponse, Error>;

export function useApi<TResponse, TBody>(
  options: ApiMutationOptions<TResponse, TBody>,
): UseMutationResult<TResponse, Error, TBody>;

export function useApi<TResponse, TBody>(
  options: ApiQueryOptions<TResponse> | ApiMutationOptions<TResponse, TBody>,
) {
  const {
    url,
    queryKey,
    enabled = true,
    autoRefetchOnWindowFocus = false,
    staleTime = 1000 * 60 * 10,
    gcTime = 1000 * 60 * 10,
    headers,
    onSuccess,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const key = queryKey ?? urlToQueryKey(url);

  if (!isMutation(options)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery<TResponse, Error>({
      queryKey: key,
      queryFn: () => request<TResponse>(url, { method: 'GET', headers }),
      enabled,
      gcTime,
      staleTime,
      refetchOnWindowFocus: autoRefetchOnWindowFocus,
    });
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<TResponse, Error, TBody>({
    mutationFn: (data) =>
      request<TResponse>(url, {
        method: options.method,
        body: data ?? options.body,
        headers,
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError,
  });
}
