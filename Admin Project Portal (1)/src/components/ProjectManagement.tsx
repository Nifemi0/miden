import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { FolderOpen, Search, Eye, Play, Pause, Calendar, Coins, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Project {
  id: string
  owner_wallet_address: string
  token_address: string
  merkle_root: string
  created_at: string
  status: 'active' | 'paused'
  name?: string
  description?: string
  total_proposals: number
  active_proposals: number
}

const ITEMS_PER_PAGE = 10

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Load projects on component mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Filter projects based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = projects.filter(project => 
        project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.owner_wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.token_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects(projects)
    }
    setCurrentPage(1)
  }, [searchTerm, projects])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      // Mock API call to fetch projects
      const mockProjects = await fetchMockProjects()
      setProjects(mockProjects)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusToggle = async (projectId: string, newStatus: 'active' | 'paused') => {
    try {
      // Mock API call to update project status
      await updateProjectStatus(projectId, newStatus)
      
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, status: newStatus } : project
      ))
      
      toast.success(`Project ${newStatus === 'active' ? 'activated' : 'paused'} successfully`)
    } catch (error) {
      toast.error('Failed to update project status')
    }
  }

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setIsDetailsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">Active</Badge>
      case 'paused':
        return <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Paused</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-blue-700">Project Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monitor and control voting status for all projects
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by ID, owner, or token address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredProjects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Paused Projects</p>
                <p className="text-xl font-bold text-orange-600">
                  {filteredProjects.filter(p => p.status === 'paused').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading projects...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Token Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proposals</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">
                        {project.id}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatAddress(project.owner_wallet_address)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatAddress(project.token_address)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(project.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium text-green-600">{project.active_proposals}</span>
                          <span className="text-muted-foreground"> / {project.total_proposals}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(project.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(project)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={project.status === 'active'}
                              onCheckedChange={(checked) => 
                                handleStatusToggle(project.id, checked ? 'active' : 'paused')
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {project.status === 'active' ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        </div>
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
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
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

      {/* Project Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              View detailed information about this project including status, ownership, and proposal activity.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Project ID</Label>
                  <p className="font-mono text-sm">{selectedProject.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Owner Wallet Address</Label>
                <p className="font-mono text-sm break-all">{selectedProject.owner_wallet_address}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Token Address</Label>
                <p className="font-mono text-sm break-all">{selectedProject.token_address}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Merkle Root</Label>
                <p className="font-mono text-sm break-all">{selectedProject.merkle_root}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Proposals</Label>
                  <p className="text-lg font-bold">{selectedProject.total_proposals}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Active Proposals</Label>
                  <p className="text-lg font-bold text-green-600">{selectedProject.active_proposals}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(selectedProject.created_at)}</p>
                </div>
              </div>

              {selectedProject.name && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Project Name</Label>
                  <p>{selectedProject.name}</p>
                </div>
              )}

              {selectedProject.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Mock API functions
async function fetchMockProjects(): Promise<Project[]> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    {
      id: 'proj_1',
      owner_wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      token_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      merkle_root: '0x9876543210fedcba9876543210fedcba98765432',
      created_at: '2024-01-15T08:00:00Z',
      status: 'active',
      name: 'DeFi Protocol Governance',
      description: 'Governance for a decentralized finance protocol',
      total_proposals: 12,
      active_proposals: 3
    },
    {
      id: 'proj_2',
      owner_wallet_address: '0xfedcba9876543210fedcba9876543210fedcba98',
      token_address: '0x1111222233334444555566667777888899990000',
      merkle_root: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
      created_at: '2024-01-16T10:15:00Z',
      status: 'active',
      name: 'NFT Marketplace DAO',
      description: 'Community governance for NFT marketplace decisions',
      total_proposals: 8,
      active_proposals: 2
    },
    {
      id: 'proj_3',
      owner_wallet_address: '0x2222333344445555666677778888999900001111',
      token_address: '0xbbbbbbccccccddddddeeeeeeffffffff00000000',
      merkle_root: '0x1234567890abcdef1234567890abcdef12345678',
      created_at: '2024-01-17T12:30:00Z',
      status: 'paused',
      name: 'Gaming Platform Governance',
      total_proposals: 15,
      active_proposals: 0
    },
    {
      id: 'proj_4',
      owner_wallet_address: '0x3333444455556666777788889999aaaa0000bbbb',
      token_address: '0xccccccddddddeeeeeeffffffff000000011111111',
      merkle_root: '0xfedcba9876543210fedcba9876543210fedcba98',
      created_at: '2024-01-18T14:45:00Z',
      status: 'active',
      total_proposals: 5,
      active_proposals: 1
    }
  ]
}

async function updateProjectStatus(projectId: string, status: 'active' | 'paused'): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500))
  // Mock API call successful
}