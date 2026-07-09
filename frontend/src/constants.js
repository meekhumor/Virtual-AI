export const ACCESS_TOKEN = "access"
export const REFRESH_TOKEN = "refresh"

export const API_BASE_URL = import.meta.env.PROD
  ? 'https://virtual-ai-iimu.onrender.com'
  : 'http://localhost:8000';