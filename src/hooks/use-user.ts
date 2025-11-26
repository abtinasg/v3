"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface ApiError {
  message: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ProfileResponse {
  id: string
  email: string
  name: string
  subscription: "free" | "pro"
  deepScore: number | null
  personalityType: string | null
  riskTolerance: "conservative" | "moderate" | "aggressive" | null
  createdAt: string
  usage: {
    aiQuestionsToday: number
    aiQuestionsLimit: number
    studyListCount: number
    studyListLimit: number
  }
}

export interface StudyListItemResponse {
  id: string
  symbol: string
  name: string
  addedAt: string
  currentPrice: number | null
  change: number | null
  changePercent: number | null
}

export interface StudyListResponse {
  items: StudyListItemResponse[]
  limit: number
  canAdd: boolean
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || json.success === false || !json.data) {
    const message = json.error?.message ?? response.statusText
    throw new Error(message || "Request failed")
  }

  return json.data
}

function showToast(message: string, type: "success" | "error") {
  if (typeof window !== "undefined") {
    const prefix = type === "success" ? "Success" : "Error"
    window.alert(`${prefix}: ${message}`)
  } else {
    if (type === "success") {
      console.log(message)
    } else {
      console.error(message)
    }
  }
}

export function useProfile() {
  const query = useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => fetchJson<ProfileResponse>("/api/user/profile"),
  })

  return {
    data: query.data as ProfileResponse | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useStudyList() {
  const query = useQuery({
    queryKey: ["user", "study-list"],
    queryFn: () => fetchJson<StudyListResponse>("/api/user/study-list"),
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAddToStudyList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (symbol: string) =>
      fetchJson<StudyListResponse>("/api/user/study-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      }),
    onSuccess: () => {
      showToast("Added to study list", "success")
      queryClient.invalidateQueries({ queryKey: ["user", "study-list"] })
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to add to study list", "error")
    },
  })
}

export function useRemoveFromStudyList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) =>
      fetchJson<{ removed: boolean }>(`/api/user/study-list/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      showToast("Removed from study list", "success")
      queryClient.invalidateQueries({ queryKey: ["user", "study-list"] })
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to remove from study list", "error")
    },
  })
}
