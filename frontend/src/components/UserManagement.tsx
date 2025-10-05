import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { UserPlus, Edit2, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { getAllUsers, updateUserRole, registerUser } from '../api'

interface User {
  id: string
  wallet_address: string
  role: 'platform_owner' | 'project_admin' | 'user'
  created_at: string
  last_active?: string
}

interface NewUser {
  wallet_address: string
  role: 'platform_owner' | 'project_admin' | 'user'
}

const ITEMS_PER_PAGE = 10

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState<NewUser>({ wallet_address: '', role: 'user' })

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
    setCurrentPage(1)
  }, [searchTerm, users])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const users = await getAllUsers()
      setUsers(users)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as User['role'] } : user
      ))
      
      toast.success('User role updated successfully')
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const handleAddUser = async () => {
    if (!newUser.wallet_address.trim()) {
      toast.error('Please enter a valid wallet address')
      return
    }

    try {
      const addedUser = await registerUser(newUser)
      
      setUsers(prev => [addedUser, ...prev])
      setNewUser({ wallet_address: '', role: 'user' })
      setIsAddDialogOpen(false)
      
      toast.success('User registered successfully')
    } catch (error) {
      toast.error('Failed to register user')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'platform_owner':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Platform Owner</Badge>
      case 'project_admin':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Project Admin</Badge>
      case 'user':
        return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card className="border-0 bg-gradient-to-r from-purple-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-700">User & Role Management</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage user roles and register new wallet addresses
                </p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register New User</DialogTitle>
                  <DialogDescription>
                    Add a new wallet address to the platform with an initial role assignment.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="wallet_address">Wallet Address</Label>
                    <Input
                      id="wallet_address"
                      placeholder="0x..."
                      value={newUser.wallet_address}
                      onChange={(e) => setNewUser(prev => ({ ...prev, wallet_address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Initial Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as User['role'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="project_admin">Project Admin</SelectItem>
                        <SelectItem value="platform_owner">Platform Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser}>
                      Register User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by wallet address or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredUsers.length} users
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading users...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">
                        {formatAddress(user.wallet_address)}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => handleRoleChange(user.id, value)}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="project_admin">Project Admin</SelectItem>
                            <SelectItem value="platform_owner">Platform Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
