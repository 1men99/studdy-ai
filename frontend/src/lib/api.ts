/**
 * Dynamically resolves the FastAPI Backend Base URL.
 * 
 * - Strips trailing slashes if present in VITE_API_BASE_URL.
 * - In local development (import.meta.env.DEV), defaults to 'http://localhost:8000'.
 * - In production, if VITE_API_BASE_URL is omitted, falls back to window.location.origin
 *   to support relative proxying instead of hardcoding localhost.
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  
  if (import.meta.env.DEV) {
    return 'http://localhost:8000'
  }

  return typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : ''
}
