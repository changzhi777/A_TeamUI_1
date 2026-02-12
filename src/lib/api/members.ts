import { api } from './client'

export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  isEmailVerified: boolean
  isOtpEnabled: boolean
  createdAt: string
  updatedAt: string
  projectCount: number
  projects?: MemberProject[]
}

export interface MemberProject {
  projectId: string
  projectName: string
  projectStatus?: string
  role: string
  joinedAt: string
}

export interface MemberListParams {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  projectIds?: string
  sortBy?: 'name' | 'email' | 'createdAt' | 'role'
  sortOrder?: 'asc' | 'desc'
}

export interface MemberListResponse {
  members: Member[]
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
}

export interface AddMemberData {
  email: string
  name: string
  role: string
  password: string
  projects?: Array<{
    id: string
    role: string
  }>
}

export interface UpdateMemberData {
  name?: string
  email?: string
  role?: string
  phone?: string
  bio?: string
}

/**
 * Get all members across all projects
 */
export async function getMembers(params?: MemberListParams): Promise<MemberListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.role) queryParams.append('role', params.role)
  if (params?.projectIds) queryParams.append('projectIds', params.projectIds)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

  const queryString = queryParams.toString()
  const url = `/members${queryString ? `?${queryString}` : ''}`

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${url}`, {
    headers: {
      'Authorization': `Bearer ${api.getAccessToken()}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch members')
  }

  return await response.json()
}

/**
 * Get member by ID
 */
export async function getMember(id: string): Promise<Member> {
  return api.get(`/members/${id}`)
}

/**
 * Add new global member
 */
export async function addMember(data: AddMemberData): Promise<{ id: string; message: string }> {
  return api.post('/members', data)
}

/**
 * Update global member
 */
export async function updateMember(id: string, data: UpdateMemberData): Promise<{ message: string }> {
  return api.put(`/members/${id}`, data)
}

/**
 * Delete global member
 */
export async function deleteMember(id: string): Promise<{ message: string }> {
  return api.delete(`/members/${id}`)
}

/**
 * Add member to project
 */
export async function addMemberToProject(
  memberId: string,
  projectId: string,
  role: string
): Promise<{ message: string }> {
  return api.post(`/members/${memberId}/projects`, { projectId, role })
}

/**
 * Remove member from project
 */
export async function removeMemberFromProject(
  memberId: string,
  projectId: string
): Promise<{ message: string }> {
  return api.delete(`/members/${memberId}/projects/${projectId}`)
}
