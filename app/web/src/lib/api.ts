import {
  User, Property, Booking, SearchParams,
  CreateBookingInput, DashboardStats,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("ejari_token") : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    requestOtp: (phone: string) =>
      request("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),

    verifyOtp: (phone: string, code: string, fullName?: string) =>
      request<{ token: string; user: User }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, code, fullName }),
      }),

    me: () => request<User>("/auth/me"),

    updateProfile: (data: { fullName?: string; email?: string }) =>
      request<User>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    becomeHost: () =>
      request<{ token: string; user: User }>("/auth/become-host", {
        method: "POST",
      }),
  },

  properties: {
    search: (params: SearchParams) => {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
        )
      ).toString();
      return request<Property[]>(`/properties${qs ? `?${qs}` : ""}`);
    },

    getById: (id: string) => request<Property>(`/properties/${id}`),

    getMine: () => request<Property[]>("/properties/my"),

    create: (data: Omit<Partial<Property>, "id" | "host" | "photos" | "createdAt">) =>
      request<Property>("/properties", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Property>) =>
      request<Property>(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    addPhoto: (id: string, url: string, isCover: boolean) =>
      request(`/properties/${id}/photos`, {
        method: "POST",
        body: JSON.stringify({ url, isCover }),
      }),
  },

  bookings: {
    create: (data: CreateBookingInput) =>
      request<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    list: () => request<Booking[]>("/bookings"),

    getById: (id: string) => request<Booking>(`/bookings/${id}`),

    stats: () => request<DashboardStats>("/bookings/stats"),

    confirm: (id: string) =>
      request<Booking>(`/bookings/${id}/confirm`, { method: "POST" }),

    cancel: (id: string) =>
      request<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
  },

  payments: {
    initiate: (bookingId: string) =>
      request<{ payUrl: string; dev?: boolean; tip?: string }>(
        "/payments/initiate",
        { method: "POST", body: JSON.stringify({ bookingId }) }
      ),

    devConfirm: (bookingId: string) =>
      request("/payments/dev-confirm", {
        method: "POST",
        body: JSON.stringify({ bookingId }),
      }),

    getInvoice: (bookingId: string) =>
      request(`/payments/invoice/${bookingId}`),
  },
};