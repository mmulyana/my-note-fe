import { useMemo } from 'react';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { request } from '../lib/api-client';
import type { IApi } from '../lib/types';
import { buildQuery } from '../lib/utils';

const PAGE_SIZE = 30;

type InfiniteApiOptions = {
  url: string;
  queryKey: readonly unknown[];
  params?: Record<string, unknown>;
  pageSize?: number;
  enabled?: boolean;
  keepPreviousData?: boolean;
  staleTime?: number;
  gcTime?: number;
};

export function useInfiniteApi<TItem extends { id: string }>({
  url,
  queryKey,
  params,
  pageSize = PAGE_SIZE,
  enabled = true,
  keepPreviousData: keepPrev = false,
  staleTime = 1000 * 60 * 10,
  gcTime = 1000 * 60 * 10,
}: InfiniteApiOptions) {
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      request<IApi<TItem[]>>(
        buildQuery(url, { ...params, limit: pageSize, lastId: pageParam }),
      ),
    getNextPageParam: (lastPage) =>
      lastPage.data.length < pageSize
        ? undefined
        : lastPage.data[lastPage.data.length - 1].id,
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    placeholderData: keepPrev ? keepPreviousData : undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );

  return { ...query, items };
}
