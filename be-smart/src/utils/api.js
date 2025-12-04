/**
 * API Utility for making HTTP requests to the backend
 * Uses VITE_BASE_URL from environment variables
 */

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint (e.g., '/api/users')
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export async function get(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint (e.g., '/api/users')
 * @param {Object} data - Data to send
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export async function post(endpoint, data, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint (e.g., '/api/users/1')
 * @param {Object} data - Data to send
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export async function put(endpoint, data, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint (e.g., '/api/users/1')
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export async function del(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get the base URL (useful for debugging or direct access)
 * @returns {string} Base URL
 */
export function getBaseUrl() {
  return API_BASE_URL;
}

export default {
  get,
  post,
  put,
  delete: del,
  getBaseUrl,
};

