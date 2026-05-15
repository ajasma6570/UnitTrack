import {
  SolarEntry,
  AnalyticsResponse,
  PaginatedResponse,
  ApiResponse,
} from './types'

export class ApiClient {
  private baseUrl = '/api'

  async createEntry(data: {
    date: string
    totalGeneration: number
    importGrid: number
    exportGrid: number
    unitUsed?: number
  }): Promise<SolarEntry> {
    const response = await fetch(`${this.baseUrl}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.error || 'Failed to create entry')
        ; (error as any).status = response.status
      throw error
    }

    const result: ApiResponse<SolarEntry> = await response.json()
    if (!result.success || !result.data) {
      const error = new Error(result.error || 'Failed to create entry')
        ; (error as any).status = response.status
      throw error
    }

    return result.data
  }

  async getEntries(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<SolarEntry>> {
    const response = await fetch(
      `${this.baseUrl}/entries?page=${page}&limit=${limit}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch entries')
    }

    return response.json()
  }

  async updateEntry(
    id: string,
    data: {
      date: string
      totalGeneration: number
      importGrid: number
      exportGrid: number
      unitUsed?: number
    }
  ): Promise<SolarEntry> {
    const response = await fetch(`${this.baseUrl}/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.error || 'Failed to update entry')
        ; (error as any).status = response.status
      throw error
    }

    const result: ApiResponse<SolarEntry> = await response.json()
    if (!result.success || !result.data) {
      const error = new Error(result.error || 'Failed to update entry')
        ; (error as any).status = response.status
      throw error
    }

    return result.data
  }

  async deleteEntry(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/entries/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete entry')
    }
  }

  async searchEntries(query: string): Promise<SolarEntry[]> {
    const response = await fetch(
      `${this.baseUrl}/entries/search?q=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      throw new Error('Failed to search entries')
    }

    return response.json()
  }

  async getAnalytics(period = 'month'): Promise<AnalyticsResponse> {
    const response = await fetch(`${this.baseUrl}/analytics?period=${period}`)

    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
