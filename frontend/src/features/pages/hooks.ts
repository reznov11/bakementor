"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPage,
  createPageVersion,
  fetchPage,
  fetchPages,
  fetchPageVersions,
  publishPage,
} from "@/features/pages/api";
import type { Page, PageDraftInput, PageVersion, PageVersionPayload, PublishResponse } from "@/types/pages";

const PAGES_QUERY_KEY = ["pages"] as const;

export const usePages = () => {
  return useQuery<Page[]>({
    queryKey: PAGES_QUERY_KEY,
    queryFn: fetchPages,
  });
};

export const usePage = (pageId: string) => {
  return useQuery<Page>({
    queryKey: [...PAGES_QUERY_KEY, pageId],
    queryFn: () => fetchPage(pageId),
    enabled: Boolean(pageId),
  });
};

export const usePageVersions = (pageId: string) => {
  return useQuery<PageVersion[]>({
    queryKey: [...PAGES_QUERY_KEY, pageId, "versions"],
    queryFn: () => fetchPageVersions(pageId),
    enabled: Boolean(pageId),
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation<Page, Error, PageDraftInput>({
    mutationFn: createPage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
};

export const useCreatePageVersion = (pageId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PageVersion, Error, PageVersionPayload>({
    mutationFn: (payload) => createPageVersion(pageId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...PAGES_QUERY_KEY, pageId, "versions"] });
      void queryClient.invalidateQueries({ queryKey: [...PAGES_QUERY_KEY, pageId] });
    },
  });
};

export const usePublishPage = (pageId: string) => {
  const queryClient = useQueryClient();
  return useMutation<PublishResponse, Error, { versionId?: string }>({
    mutationFn: ({ versionId }) => publishPage(pageId, versionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...PAGES_QUERY_KEY, pageId] });
      void queryClient.invalidateQueries({ queryKey: [...PAGES_QUERY_KEY, pageId, "versions"] });
      void queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY });
    },
  });
};

