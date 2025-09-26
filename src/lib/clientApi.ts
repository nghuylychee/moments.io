"use client";

export function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem("token");
}

export function setToken(token: string) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem("token", token);
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
	const token = getToken();
	const headers: HeadersInit = {
		"content-type": "application/json",
		...(init.headers || {}),
	};
	if (token) {
		headers["authorization"] = `Bearer ${token}`;
	}
	return fetch(input, { ...init, headers });
}
