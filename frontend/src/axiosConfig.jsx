import axios from 'axios';

/**
 * Shared Axios instance used by every page and component to call the backend API.
 *
 * ## Why baseURL is an empty string (relative URLs)
 *
 * ### The problem
 * The original config hardcoded an absolute URL:
 *
 *   baseURL: 'http://localhost:5001'        // worked only on a local machine
 *   baseURL: 'http://<EC2-IP>:5001'         // broke for any other IP; bypassed nginx
 *
 * When the app was deployed behind nginx and accessed via a public IP, the browser
 * tried to open a direct connection to localhost:5001 (or the hardcoded EC2 IP on
 * port 5001). Both fail in production because:
 *   1. Port 5001 is not exposed through nginx — only port 80 is.
 *   2. "localhost" in a browser means the *user's* machine, not the server.
 *   3. A hardcoded IP breaks the moment the server address changes.
 *
 * ### The fix
 * Setting baseURL to '' makes every axios call use a path-only URL, e.g.
 *   axiosInstance.get('/api/products')
 *   → GET http://<whatever-host-the-page-loaded-from>/api/products
 *
 * The request goes to the same origin as the frontend, which is nginx.
 * Nginx then routes it to the correct service based on the path:
 *
 *   location /api { proxy_pass http://localhost:5001; }  ← Express backend
 *   location /    { proxy_pass http://localhost:3000; }  ← React frontend
 *
 * This works regardless of the server's IP address or domain name, and keeps
 * all traffic on port 80 (the only port nginx exposes publicly).
 */
const axiosInstance = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// Unwrap ResponseFactory envelope { success, message, data } transparently.
// Endpoints that return raw data are passed through unchanged.
axiosInstance.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
    return { ...response, data: response.data.data };
  }
  return response;
});

export default axiosInstance;
