export interface User {
  id: string;
  name: string;
  grade: string;
  created_at: string;
}

export interface Shelf {
  id: string;
  row: string;
  col: number;
  name: string;
  description: string;
  item_count: number;
  available_count: number;
}

export interface Item {
  id: string;
  name: string;
  shelf_id: string;
  category: string;
  description: string;
  image_url?: string | null;
  status: "available" | "in_use";
  current_user_id?: string | null;
  current_user_name?: string | null;
  last_user_name?: string | null;
  last_used_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  item_id: string;
  item_name: string;
  user_id: string;
  user_name: string;
  action: "borrow" | "return";
  timestamp: string;
}

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_PREFIX = RAW_BASE_URL ? `${RAW_BASE_URL}/api` : '/api';

export const getFullImageUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return RAW_BASE_URL ? `${RAW_BASE_URL}${path}` : path;
};

export const api = {
  // Shelves
  async getShelves(): Promise<Shelf[]> {
    const res = await fetch(`${API_PREFIX}/shelves`);
    if (!res.ok) throw new Error('棚一覧の取得に失敗しました');
    return res.json();
  },

  async getShelf(shelfId: string): Promise<{ shelf: Shelf; items: Item[] }> {
    const res = await fetch(`${API_PREFIX}/shelves/${shelfId}`);
    if (!res.ok) throw new Error('棚の詳細取得に失敗しました');
    return res.json();
  },

  // Items
  async getItems(params?: {
    q?: string;
    shelf_id?: string;
    status?: string;
    category?: string;
    user_id?: string;
  }): Promise<Item[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.shelf_id) query.append('shelf_id', params.shelf_id);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.user_id) query.append('user_id', params.user_id);

    const res = await fetch(`${API_PREFIX}/items?${query.toString()}`);
    if (!res.ok) throw new Error('備品一覧の取得に失敗しました');
    return res.json();
  },

  async getItem(itemId: string): Promise<{ item: Item; shelf?: Shelf; logs: UsageLog[] }> {
    const res = await fetch(`${API_PREFIX}/items/${itemId}`);
    if (!res.ok) throw new Error('備品詳細の取得に失敗しました');
    return res.json();
  },

  async createItem(item: {
    name: string;
    shelf_id: string;
    category?: string;
    description?: string;
    image_url?: string;
  }): Promise<Item> {
    const res = await fetch(`${API_PREFIX}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || '備品の登録に失敗しました');
    }
    return res.json();
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_PREFIX}/items/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || '画像のアップロードに失敗しました');
    }
    return res.json();
  },

  async borrowItem(itemId: string, userId: string): Promise<Item> {
    const res = await fetch(`${API_PREFIX}/items/${itemId}/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || '備品の使用処理に失敗しました');
    }
    return res.json();
  },

  async returnItem(itemId: string, userId?: string): Promise<Item> {
    const res = await fetch(`${API_PREFIX}/items/${itemId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId || '' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || '備品の返却処理に失敗しました');
    }
    return res.json();
  },

  async deleteItem(itemId: string): Promise<void> {
    const res = await fetch(`${API_PREFIX}/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || '備品の削除に失敗しました');
    }
  },

  async clearDemoData(): Promise<{ status: string; deleted: Record<string, number> }> {
    const res = await fetch(`${API_PREFIX}/items/admin/clear-demo-data`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'ダミーデータの削除に失敗しました');
    }
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_PREFIX}/users`);
    if (!res.ok) throw new Error('ユーザー一覧の取得に失敗しました');
    return res.json();
  },

  async getUser(userId: string): Promise<{ user: User; borrowed_items: Item[]; logs: UsageLog[] }> {
    const res = await fetch(`${API_PREFIX}/users/${userId}`);
    if (!res.ok) throw new Error('ユーザー情報の取得に失敗しました');
    return res.json();
  },

  async createUser(name: string, grade: string): Promise<User> {
    const res = await fetch(`${API_PREFIX}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, grade }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'ユーザー登録に失敗しました');
    }
    return res.json();
  },

  async loginUser(name: string, grade: string): Promise<User> {
    const res = await fetch(`${API_PREFIX}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, grade }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'ログインに失敗しました');
    }
    return res.json();
  },

  // Logs
  async getLogs(limit: number = 50): Promise<UsageLog[]> {
    const res = await fetch(`${API_PREFIX}/logs?limit=${limit}`);
    if (!res.ok) throw new Error('ログの取得に失敗しました');
    return res.json();
  },

  // Export URLs
  getExportJsonUrl(): string {
    return `${API_PREFIX}/items/export/json`;
  },
  getExportCsvUrl(): string {
    return `${API_PREFIX}/items/export/csv`;
  }
};
