/**
 * URL Management Utility
 * Centralized management of API base URLs with backwards compatibility
 */

export const BASE_DOMAIN = "https://microlearning-api.keepnet-labs-ltd-business-profile4086.workers.dev/microlearning";
export const DEFAULT_COURSE_ID = "phishing-001";

/**
 * Normalize URL parameters (remove quotes, @ symbols)
 */
export const normalizeUrlParam = (value?: string | null): string => {
  if (!value) return '';
  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
};

/**
 * Get API base URL from query parameters with backwards compatibility
 *
 * Priority:
 * 1. courseId parameter (NEW - preferred way)
 * 2. baseUrl parameter (OLD - backwards compatibility)
 * 3. Default course ID
 *
 * Examples:
 * - ?courseId=phishing-001 → https://.../microlearning/phishing-001
 * - ?baseUrl=phishing-001 → https://.../microlearning/phishing-001 (backwards compat)
 * - ?baseUrl=https://... → https://... (full URL, backwards compat)
 * - (no params) → https://.../microlearning/phishing-001 (default)
 */
export const getApiBaseUrl = (): string => {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  if (!urlParams) {
    return `${BASE_DOMAIN}/${DEFAULT_COURSE_ID}`;
  }

  // New way: courseId parameter (only course ID)
  const courseId = normalizeUrlParam(urlParams.get('courseId'));
  if (courseId) {
    return `${BASE_DOMAIN}/${courseId}`;
  }

  // Backwards compatibility: baseUrl parameter (full URL or course ID)
  const baseUrlParam = normalizeUrlParam(urlParams.get('baseUrl'));
  if (baseUrlParam) {
    // If it's a full URL, use as-is; otherwise treat as course ID
    return baseUrlParam.includes('http') ? baseUrlParam : `${BASE_DOMAIN}/${baseUrlParam}`;
  }

  // Default
  return `${BASE_DOMAIN}/${DEFAULT_COURSE_ID}`;
};

/**
 * Get the base domain (without course ID)
 * Useful for constructing language paths, etc.
 */
export const getBaseDomain = (): string => {
  const baseUrl = getApiBaseUrl();
  // Extract just the domain part (everything before /microlearning/)
  return baseUrl.split('/microlearning')[0] + '/microlearning';
};

/**
 * Extract course ID from the current API URL
 */
export const getCurrentCourseId = (): string => {
  const baseUrl = getApiBaseUrl();
  const parts = baseUrl.split('/');
  return parts[parts.length - 1] || DEFAULT_COURSE_ID;
};
