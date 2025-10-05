import { Proposal } from './components/VoteExplorer';
import { User } from './components/UserManagement';
import { Project } from './components/ProjectManagement';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helper function for authenticated API calls
async function authenticatedFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem('jwt_token'); // Assuming token is stored in localStorage
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Handle unauthorized/forbidden access, e.g., redirect to login
    console.error('Authentication error');
    // Optionally, clear token and redirect
    localStorage.removeItem('jwt_token');
    // window.location.href = '/login';
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
}

export const getProposals = async (): Promise<Proposal[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/proposals`);
  return response.map((prop: any) => ({
    id: prop.id,
    project_id: prop.project_id,
    title: prop.title,
    description: prop.description || '',
    status: prop.state, // Map backend 'state' to frontend 'status'
    voting_model: prop.model_enum, // Map backend 'model_enum' to frontend 'voting_model'
    deadline: prop.end_ts,
    is_revoked: prop.revoked,
    created_at: prop.start_ts, // Using start_ts as created_at for now
    updated_at: prop.updated_at, // Assuming backend provides 'updated_at'
    vote_count_yes: prop.yes_votes || 0,
    vote_count_no: prop.no_votes || 0,
    quorum_percentage: prop.quorum_percentage || 0,
  }));
};

// User Management APIs
export const getAllUsers = async (): Promise<User[]> => {
  return authenticatedFetch(`${API_BASE_URL}/users`);
};

export const updateUserRole = async (walletAddress: string, role: User['role']): Promise<User> => {
  return authenticatedFetch(`${API_BASE_URL}/users/${walletAddress}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
};

export const registerUser = async (walletAddress: string, role: User['role']): Promise<User> => {
  return authenticatedFetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify({ wallet_address: walletAddress, role }),
  });
};

// Project Management APIs
export const getAllProjects = async (): Promise<Project[]> => {
  return authenticatedFetch(`${API_BASE_URL}/projects`);
};

export const updateProjectStatus = async (projectId: string, status: Project['status']): Promise<Project> => {
  return authenticatedFetch(`${API_BASE_URL}/projects/${projectId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Proposal Management APIs
export const revokeProposal = async (proposalId: string): Promise<Proposal> => {
  return authenticatedFetch(`${API_BASE_URL}/proposals/${proposalId}/revoke`, {
    method: 'POST',
  });
};

export const finalizeTally = async (proposalId: string): Promise<Proposal> => {
  return authenticatedFetch(`${API_BASE_URL}/proposals/${proposalId}/finalize`, {
    method: 'POST',
  });
};

// Auth APIs
export const login = async (walletAddress: string, signedMessage: string): Promise<{ token: string }> => {
  return authenticatedFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ wallet_address: walletAddress, signed_message: signedMessage }),
  });
};

export const createProposal = async (proposalData: any): Promise<Proposal> => {
  return authenticatedFetch(`${API_BASE_URL}/proposals`, {
    method: 'POST',
    body: JSON.stringify(proposalData),
  });
};

export const castVote = async (proposalId: string, walletAddress: string, choice: string, signature: string): Promise<any> => {
  return authenticatedFetch(`${API_BASE_URL}/proposals/${proposalId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ wallet_address: walletAddress, choice, signature }),
  });
};
