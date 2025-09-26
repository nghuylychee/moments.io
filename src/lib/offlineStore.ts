"use client";

import { idbGetBlob, idbSetBlob } from "@/lib/idb";

export type OfflineCard = {
	id: string;
	slug: string;
	title: string;
	type: string;
	number_no: number;
	front_key: string; // IDB key
	back_key: string; // IDB key
	video_duration_sec: number;
	status: "draft" | "published";
	created_at: string;
	published_at?: string | null;
};

const KEY = "offline_cards_meta";

function readAll(): OfflineCard[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as OfflineCard[]) : [];
	} catch {
		return [];
	}
}

function writeAll(items: OfflineCard[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(KEY, JSON.stringify(items));
}

function slugify(s: string) {
	return s
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
}

export async function createCard(input: { title: string; type: string; number_no: number; front_blob: Blob; back_blob: Blob; video_duration_sec: number; }): Promise<OfflineCard> {
	const all = readAll();
	const baseSlug = `${slugify(input.title)}-${slugify(input.type)}-${input.number_no}`;
	let slug = baseSlug;
	let attempt = 1;
	while (all.some((c) => c.slug === slug)) slug = `${baseSlug}-${attempt++}`;
	const id = crypto.randomUUID();
	const front_key = `${id}-front`;
	const back_key = `${id}-back`;
	await Promise.all([idbSetBlob(front_key, input.front_blob), idbSetBlob(back_key, input.back_blob)]);
	const card: OfflineCard = {
		id,
		slug,
		title: input.title,
		type: input.type,
		number_no: input.number_no,
		front_key,
		back_key,
		video_duration_sec: input.video_duration_sec,
		status: "draft",
		created_at: new Date().toISOString(),
		published_at: null,
	};
	writeAll([card, ...all]);
	return card;
}

export function listCards(filter?: { status?: "draft" | "published" }) {
	const all = readAll();
	return filter?.status ? all.filter((c) => c.status === filter.status) : all;
}

export function publishCard(id: string) {
	const all = readAll();
	const idx = all.findIndex((c) => c.id === id);
	if (idx === -1) return null;
	all[idx] = { ...all[idx], status: "published", published_at: new Date().toISOString() };
	writeAll(all);
	return all[idx];
}

export function getCardMeta(id: string) {
	return readAll().find((c) => c.id === id) || null;
}

export async function resolveMediaUrl(key: string): Promise<string | null> {
	const blob = await idbGetBlob(key);
	return blob ? URL.createObjectURL(blob) : null;
}
