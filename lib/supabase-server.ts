import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

let serverClient: ReturnType<typeof createServerClient> | null = null;

export const getSupabaseServer = async () => {
  if (!serverClient) {
    const cookieStore = await cookies();
    serverClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle error if cookies can't be set
            }
          },
        },
      }
    );
  }
  return serverClient;
};

export const getCurrentUser = async () => {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const checkAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
};

export const getUserRole = async (userId: string) => {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from('users')
    .select('role, farms:farm_assignments(farm_id)')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
};
