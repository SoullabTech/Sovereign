export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); // or use your auth context/state

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return res.json();
}
