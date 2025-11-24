import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import SacredMirror from '../../components/SacredMirror';

export const metadata = {
  title: 'Sacred Mirror - Spiralogic Oracle System',
  description: 'Where technology meets the sacred. Your personal oracle interface.',
};

export default async function SacredMirrorPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile for display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, full_name')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name || profile?.full_name || user.email?.split('@')[0];

  return (
    <div className="min-h-screen">
      <SacredMirror 
        userId={user.id}
        userName={displayName}
      />
    </div>
  );
}