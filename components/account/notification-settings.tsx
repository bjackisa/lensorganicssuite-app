'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Save, Loader2 } from 'lucide-react';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
}

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'farm_activities',
      label: 'Farm Activities',
      description: 'Notifications about farm operations and activities',
      email: true,
      push: true,
    },
    {
      id: 'equipment_maintenance',
      label: 'Equipment Maintenance',
      description: 'Reminders for equipment maintenance schedules',
      email: true,
      push: false,
    },
    {
      id: 'financial_alerts',
      label: 'Financial Alerts',
      description: 'Alerts about invoices, payments, and expenses',
      email: true,
      push: true,
    },
    {
      id: 'employee_updates',
      label: 'Employee Updates',
      description: 'Notifications about employee activities and attendance',
      email: false,
      push: false,
    },
    {
      id: 'system_updates',
      label: 'System Updates',
      description: 'Important system announcements and updates',
      email: true,
      push: true,
    },
  ]);

  const toggleSetting = (id: string, type: 'email' | 'push') => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, [type]: !setting[type] } : setting
      )
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Choose how you want to receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-[1fr,80px,80px] gap-4 pb-2 border-b text-sm font-medium text-gray-600">
            <span>Notification Type</span>
            <span className="text-center flex items-center justify-center gap-1">
              <Mail className="h-4 w-4" /> Email
            </span>
            <span className="text-center flex items-center justify-center gap-1">
              <Smartphone className="h-4 w-4" /> Push
            </span>
          </div>

          {/* Settings */}
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="grid grid-cols-[1fr,80px,80px] gap-4 py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-sm">{setting.label}</p>
                <p className="text-xs text-gray-600">{setting.description}</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => toggleSetting(setting.id, 'email')}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    setting.email ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                      setting.email ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => toggleSetting(setting.id, 'push')}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    setting.push ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                      setting.push ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
