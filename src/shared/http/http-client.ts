export class HttpClient {
  protected async request<T>(url: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers ?? {})
        }
      });

      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(`HTTP ${response.status} calling ${url}: ${JSON.stringify(body)}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return { message: response.statusText };
  }
}
