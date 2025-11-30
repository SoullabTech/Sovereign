const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const sendOracleQuery = async (input: string) => {
  const res = await fetch(`${BASE_URL}/api/oracle/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  return res.json();
};
