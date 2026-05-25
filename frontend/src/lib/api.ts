import { Assignment } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function getAssignments(search?: string): Promise<Assignment[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchAPI<Assignment[]>(`/api/assignments${query}`);
}

export async function getAssignment(id: string): Promise<Assignment> {
  return fetchAPI<Assignment>(`/api/assignments/${id}`);
}

export async function createAssignment(data: Record<string, any>): Promise<Assignment> {
  return fetchAPI<Assignment>('/api/assignments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAssignment(id: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/api/assignments/${id}`, {
    method: 'DELETE',
  });
}

export async function generatePaper(id: string): Promise<{ jobId: string; assignmentId: string }> {
  return fetchAPI<{ jobId: string; assignmentId: string }>(`/api/assignments/${id}/generate`, {
    method: 'POST',
  });
}

export async function getJobStatus(id: string): Promise<{ status: string; assignmentId: string }> {
  return fetchAPI<{ status: string; assignmentId: string }>(`/api/assignments/${id}/status`);
}

export async function uploadFile(file: File): Promise<{ fileUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('File upload failed');
  }

  return res.json();
}
