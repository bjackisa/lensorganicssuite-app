import { getCurrentUser, getUserRole, getSupabaseServer } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Shield, Calendar, Building } from 'lucide-react';
import { ProfileForm } from '@/components/profile/profile-form';

async function getUserProfile(userId: string) {
  const supabase = await getSupabaseServer();
  
  const { data: profile, error } = await supabase
    .from('users')
    .select('*, roles(name, description)')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return profile;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const userRole = await getUserRole(user?.id || '');
  const profile = user?.id ? await getUserProfile(user.id) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-3 w-3" />
                {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">Role</p>
                <p className="text-xs text-gray-600 capitalize">{userRole?.role || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-xs text-gray-600">{profile?.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-xs text-gray-600">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <ProfileForm 
        userId={user?.id || ''} 
        initialData={{
          fullName: profile?.full_name || '',
          email: user?.email || '',
          phone: profile?.phone || '',
        }}
      />

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Permissions</CardTitle>
          <CardDescription>Your access level in Lens Organics Suite</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium capitalize">{userRole?.role || 'User'}</p>
                <p className="text-sm text-gray-600">
                  {userRole?.role === 'it_admin' && 'Full system access including user management'}
                  {userRole?.role === 'managing_director' && 'Access to all farm operations and financial data'}
                  {userRole?.role === 'field_manager' && 'Manage farm operations and field activities'}
                  {!userRole?.role && 'Basic access to the system'}
                </p>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800">
                {userRole?.role === 'it_admin' ? 'Admin' : 'User'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Contact your system administrator if you need different access permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
