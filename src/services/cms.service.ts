import type { LandingPageCmsData } from '../types/cms';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer admin-token',
  'x-admin-key': 'admin',
  'x-admin-role': 'Admin',
};

export const cmsService = {
  async getCmsData(mode: 'draft' | 'published' = 'draft'): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE_URL}/cms/landing-page?mode=${mode}`, {
      headers: {
        'Authorization': 'Bearer admin-token',
        'x-admin-key': 'admin',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch CMS content (${res.status} ${res.statusText})`);
    }
    const json = await res.json();
    return json.data;
  },

  async saveDraft(data: LandingPageCmsData): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE_URL}/cms/landing-page`, {
      method: 'PUT',
      headers: ADMIN_HEADERS,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to save CMS draft (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  async publishContent(): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE_URL}/cms/landing-page/publish`, {
      method: 'POST',
      headers: ADMIN_HEADERS,
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Failed to publish content (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  async uploadMedia(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/cms/upload`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token',
        'x-admin-key': 'admin',
      },
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Media upload failed (${res.status})`);
    }
    return res.json();
  },

  async resetToDefaults(): Promise<LandingPageCmsData> {
    const res = await fetch(`${API_BASE_URL}/cms/reset`, {
      method: 'POST',
      headers: ADMIN_HEADERS,
    });
    if (!res.ok) {
      throw new Error(`Reset failed (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },
};
