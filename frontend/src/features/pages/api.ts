import { apiClient } from "@/lib/api-client";
import type {
  Page,
  PageDraftInput,
  PageVersion,
  PageVersionPayload,
  PublishResponse,
} from "@/types/pages";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const fetchPages = async (): Promise<Page[]> => {
  const { data } = await apiClient.get<PaginatedResponse<Page>>("/pages/");
  return data.results ?? [];
};

export const fetchPage = async (pageId: string): Promise<Page> => {
  const { data } = await apiClient.get<Page>(`/pages/${pageId}/`);
  return data;
};

export const fetchPageVersions = async (pageId: string): Promise<PageVersion[]> => {
  const { data } = await apiClient.get<PageVersion[]>(`/pages/${pageId}/versions/`);
  return data;
};

export const createPage = async (payload: PageDraftInput): Promise<Page> => {
  const { data } = await apiClient.post<Page>("/pages/", payload);
  return data;
};

export const createPageVersion = async (
  pageId: string,
  payload: PageVersionPayload,
): Promise<PageVersion> => {
  const { data } = await apiClient.post<PageVersion>(`/pages/${pageId}/versions/`, payload);
  return data;
};

export const publishPage = async (pageId: string, versionId?: string): Promise<PublishResponse> => {
  const { data } = await apiClient.post<PublishResponse>(`/pages/${pageId}/publish/`, {
    version_id: versionId,
  });
  return data;
};
