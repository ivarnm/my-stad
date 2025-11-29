/**
 * A reusable, type-safe fetch wrapper for making API calls.
 * It automatically adds the base URL and authorization headers.
 *
 * @param baseUrl The base URL for the API (e.g., process.env.API_BASE_URL).
 *
 * @param endpoint The API endpoint to call (e.g., '/users').
 * @param options The standard `fetch` options (method, body, etc.).
 * @param accessToken Optional access token for authorization.
 */
async function httpClient<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const fullUrl = `${baseUrl}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    defaultHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(fullUrl, mergedOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API call failed with status ${response.status}: ${errorBody}`
      );
    }

    if (response.headers.get("Content-Length") === "0") {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error("HTTP Client Error:", error);
    throw error;
  }
}

export default httpClient;
