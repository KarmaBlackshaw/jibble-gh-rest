export interface GithubOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GithubLicense {
  key: string;
  name: string;
  spdx_id: string | null;
}

export interface GithubRepo {
  id: number;
  full_name: string;
  name: string;
  html_url: string;
  owner: GithubOwner;
  description: string | null;
  language: string | null;
  homepage: string | null;
  license: GithubLicense | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count?: number;
  archived: boolean;
  fork: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GithubRepoSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepo[];
}

export interface GithubErrorBody {
  message: string;
  documentation_url?: string | null;
  errors?: { message?: string }[];
}
