"use client";

function withDB<T>(fn: (db: IDBDatabase) => void): Promise<T> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open("moments_media", 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("media")) db.createObjectStore("media");
		};
		req.onerror = () => reject(req.error);
		req.onsuccess = () => {
			const db = req.result;
			db.onversionchange = () => db.close();
			resolve(fn(db) as unknown as T);
		};
	});
}

export async function idbSetBlob(key: string, blob: Blob): Promise<void> {
	await withDB<void>((db) => {
		return new Promise((resolve, reject) => {
			const tx = db.transaction("media", "readwrite");
			const store = tx.objectStore("media");
			store.put(blob, key);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	});
}

export async function idbGetBlob(key: string): Promise<Blob | null> {
	return withDB<Promise<Blob | null>>((db) => {
		return new Promise((resolve, _reject) => {
			const tx = db.transaction("media", "readonly");
			const store = tx.objectStore("media");
			const req = store.get(key);
			req.onsuccess = () => resolve((req.result as Blob) ?? null);
			req.onerror = () => resolve(null);
		});
	});
}

export async function idbDelete(key: string): Promise<void> {
	await withDB<void>((db) => {
		return new Promise((resolve, reject) => {
			const tx = db.transaction("media", "readwrite");
			const store = tx.objectStore("media");
			store.delete(key);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	});
}
