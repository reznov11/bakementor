import type { User } from "@/types/auth";

export type PublishStatus = "draft" | "review" | "published";

export interface PageVersion {
  id: string;
  page: string;
  version: number;
  title: string;
  notes: string;
  component_tree: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: PublishStatus;
  is_public: boolean;
  tags: string[];
  owner: string;
  owner_email: string;
  current_version: PageVersion | null;
  published_version: PageVersion | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageDraftInput {
  title: string;
  description?: string;
  tags?: string[];
  initial_version: {
    title: string;
    notes?: string;
    component_tree: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
}

export interface PageVersionPayload {
  title: string;
  notes?: string;
  component_tree: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface PublishResponse {
  page_id: string;
  published_at: string | null;
  version: PageVersion;
}

export interface PageVisit {
  id: string;
  page: string;
  user: User | null;
  session_id: string;
  ip_address: string;
  user_agent: string;
  referer: string;
  visited_at: string;
}

export interface PageDailySummary {
  id: string;
  page: string;
  date: string;
  views: number;
  unique_visitors: number;
  created_at: string;
  updated_at: string;
}

