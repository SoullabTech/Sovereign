import JoinClient from './JoinClient';

// Client-facing consent gate. Web-only (the client may not have the app). The page renders a
// client component that fetches the token state; all data fetching happens client-side.
// NOTE (capacitor): this dynamic route is web-only — exclude it from the iOS static export.
export default async function SessionJoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <JoinClient token={token} />;
}
