'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Loader2 } from 'lucide-react';
import { createUser } from '@/app/actions/users';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'field_manager' | 'managing_director' | 'it_admin';
  farm_assignments: { farm_id: string }[];
  status: 'active' | 'inactive';
}

interface UserManagementProps {
  initialUsers?: User[];
}

export function UserManagement({ initialUsers = [] }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'field_manager' as 'field_manager' | 'managing_director' | 'it_admin',
    farms: [] as string[],
  });

  const handleAddUser = () => {
    if (!newUser.email || !newUser.fullName || !newUser.password) {
      alert('Please fill all fields');
      return;
    }

    startTransition(async () => {
      const result = await createUser(
        newUser.email,
        newUser.password,
        newUser.fullName,
        newUser.role,
        newUser.farms
      );

      if (result.error) {
        alert('Error creating user: ' + result.error);
      } else {
        setOpen(false);
        setNewUser({ email: '', fullName: '', password: '', role: 'field_manager', farms: [] });
        // Refetch users would happen here
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Create and manage user accounts and roles</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the Lens Organics Suite</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="user@lensorganics.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Full Name"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={newUser.role} onValueChange={(role: any) => setNewUser({ ...newUser, role })} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field_manager">Field Manager</SelectItem>
                    <SelectItem value="managing_director">Managing Director</SelectItem>
                    <SelectItem value="it_admin">IT Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full bg-emerald-600" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Farms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
                <TableCell>{user.farm_assignments.length > 0 ? `${user.farm_assignments.length} farms` : 'None'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
