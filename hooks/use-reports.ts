import useSWR from "swr"
import { Report } from "@/lib/types"

interface ApiResponse {
  reports?: Report[]
  report?: Report
  error?: string
}

interface JsonResponse {
  reports: Report[]
}

const fetcher = async (url: string): Promise<Report[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch")
  }
  const data: JsonResponse = await response.json()
  return data.reports || []
}

export function useReports() {
  const { data, error, isLoading, mutate } = useSWR<Report[]>(
    "/api/reports",
    fetcher
  )

  const createReport = async (reportData: Omit<Report, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error("Failed to create report")
      }

      const data: ApiResponse = await response.json()
      mutate()
      return data.report
    } catch (error) {
      throw error
    }
  }

  const updateReport = async (id: string, reportData: Partial<Report>) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error("Failed to update report")
      }

      const data: ApiResponse = await response.json()
      mutate()
      return data.report
    } catch (error) {
      throw error
    }
  }

  const deleteReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete report")
      }

      mutate()
    } catch (error) {
      throw error
    }
  }

  return {
    reports: data || [],
    isLoading,
    error,
    createReport,
    updateReport,
    deleteReport,
    mutate,
  }
}
