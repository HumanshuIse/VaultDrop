// src/api.js
const API_URL = 'http://localhost:5000';

export const sendRegisterOtp = (email) =>
  fetch(`${API_URL}/send-register-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  }).then(res => res.json());

export const register = (firstName, lastName, email, password, otp) =>
  fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, otp })
  }).then(res => res.json());

export const login = (email, password) =>
  fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(res => res.json());

export const uploadFile = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  }).then(res => res.json());
};

// Multi-file upload with progress callback
export const uploadFiles = (files, token, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      let response;
      try {
        response = JSON.parse(xhr.responseText);
      } catch (e) {
        return reject({ message: 'Unexpected server error. Please try again.' });
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject(response);
      }
    };
    xhr.onerror = () => reject({ message: 'Upload failed.' });
    xhr.send(formData);
  });
};

// Generic API helpers for GET, POST, PUT, DELETE
const api = {
  get: (url, options = {}) => fetch(`${API_URL}${url}`, { ...options, method: 'GET' }).then(async res => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  }),
  post: (url, body = {}, options = {}) => fetch(`${API_URL}${url}`, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body)
  }).then(async res => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  }),
  put: (url, body = {}, options = {}) => fetch(`${API_URL}${url}`, {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body)
  }).then(async res => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  }),
  delete: (url, options = {}) => fetch(`${API_URL}${url}`, { ...options, method: 'DELETE' }).then(async res => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  })
};

export default api;
