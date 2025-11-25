// Backend Supabase Client for API routes
// This file provides a Supabase-compatible interface using REST API

// Server-side environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Check for mock mode
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_SUPABASE === "true" || process.env.MOCK_SUPABASE === "true";

// Create a Supabase-compatible client using REST API
export const supabase = (() => {
  if (MOCK_MODE) {
    console.log("⚡ [SUPABASE] Backend in MOCK mode (no DB operations)");
    return null;
  }

  if (!url || !anonKey) {
    console.warn("[SUPABASE] Missing environment variables. Running without database.");
    return null;
  }

  console.log("[SUPABASE] Backend client initialized");

  // Return a REST-based client that mimics Supabase interface
  return {
    from: (table: string) => ({
      select: (columns = '*') => {
        let queryParams = `select=${columns}`;

        return {
          order: (column: string, options?: { ascending?: boolean }) => {
            const direction = options?.ascending === false ? 'desc' : 'asc';
            queryParams += `&order=${column}.${direction}`;

            return {
              limit: (count: number) => {
                queryParams += `&limit=${count}`;

                return {
                  then: async () => {
                    try {
                      const response = await fetch(`${url}/rest/v1/${table}?${queryParams}`, {
                        headers: {
                          'apikey': anonKey,
                          'Authorization': `Bearer ${anonKey}`,
                        }
                      });
                      const data = await response.json();
                      return { data: response.ok ? data : null, error: response.ok ? null : data };
                    } catch (error) {
                      return { data: null, error };
                    }
                  }
                };
              },
              then: async () => {
                try {
                  const response = await fetch(`${url}/rest/v1/${table}?${queryParams}`, {
                    headers: {
                      'apikey': anonKey,
                      'Authorization': `Bearer ${anonKey}`,
                    }
                  });
                  const data = await response.json();
                  return { data: response.ok ? data : null, error: response.ok ? null : data };
                } catch (error) {
                  return { data: null, error };
                }
              }
            };
          },
          limit: (count: number) => {
            queryParams += `&limit=${count}`;

            return {
              then: async () => {
                try {
                  const response = await fetch(`${url}/rest/v1/${table}?${queryParams}`, {
                    headers: {
                      'apikey': anonKey,
                      'Authorization': `Bearer ${anonKey}`,
                    }
                  });
                  const data = await response.json();
                  return { data: response.ok ? data : null, error: response.ok ? null : data };
                } catch (error) {
                  return { data: null, error };
                }
              }
            };
          },
          then: async () => {
            try {
              const response = await fetch(`${url}/rest/v1/${table}?${queryParams}`, {
                headers: {
                  'apikey': anonKey,
                  'Authorization': `Bearer ${anonKey}`,
                }
              });
              const data = await response.json();
              return { data: response.ok ? data : null, error: response.ok ? null : data };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      },
      insert: async (values: any) => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(values)
          });
          const data = response.ok && response.status !== 204 ? await response.json() : null;
          return { data, error: response.ok ? null : data };
        } catch (error) {
          return { data: null, error };
        }
      },
      update: async (values: any) => ({
        eq: (column: string, value: any) => ({
          then: async () => {
            try {
              const response = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
                method: 'PATCH',
                headers: {
                  'apikey': anonKey,
                  'Authorization': `Bearer ${anonKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
              });
              const data = response.ok ? await response.json() : null;
              return { data, error: response.ok ? null : data };
            } catch (error) {
              return { data: null, error };
            }
          }
        })
      }),
      delete: async () => ({
        eq: (column: string, value: any) => ({
          then: async () => {
            try {
              const response = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
                method: 'DELETE',
                headers: {
                  'apikey': anonKey,
                  'Authorization': `Bearer ${anonKey}`,
                }
              });
              return { data: null, error: response.ok ? null : await response.json() };
            } catch (error) {
              return { data: null, error };
            }
          }
        })
      })
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null })
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => {
          try {
            const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
              method: 'POST',
              headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
              },
              body: file
            });
            return { data: response.ok ? { path } : null, error: response.ok ? null : await response.json() };
          } catch (error) {
            return { data: null, error };
          }
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `${url}/storage/v1/object/public/${bucket}/${path}` }
        })
      })
    }
  };
})();

// Export helper to check if Supabase is available
export const isSupabaseConfigured = supabase !== null;