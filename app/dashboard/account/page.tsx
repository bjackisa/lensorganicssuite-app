import { getCurrentUser, getUserRole } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Key, Bell, Smartphone, Globe, 
  Lock, AlertTriangle, CheckCircle, Settings
} from 'lucide-react';
import { PasswordChangeForm } from '@/components/account/password-change-form';
import { NotificationSettings } from '@/components/account/notification-settings';

export default async function AccountPage() {
  const user = await getCurrentUser();
  const userRole = await getUserRole(user?.id || '');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account security and preferences</p>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Security Overview
          </CardTitle>
          <CardDescription>Your account security status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Email Verified</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Password</p>
                  <p className="text-xs text-gray-600">Last changed: Unknown</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Set</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-sm">Two-Factor Auth</p>
                  <p className="text-xs text-gray-600">Extra security layer</p>
                </div>
              </div>
              <Badge className="bg-gray-100 text-gray-800">Not Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Active Sessions</p>
                  <p className="text-xs text-gray-600">Current login sessions</p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">1 Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <PasswordChangeForm />

      {/* Notification Settings */}
      <NotificationSettings />

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-sm text-red-800">Deactivate Account</p>
                <p className="text-xs text-red-600">
                  Temporarily disable your account. You can reactivate it later.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Deactivate
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Contact your system administrator if you need to permanently delete your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
