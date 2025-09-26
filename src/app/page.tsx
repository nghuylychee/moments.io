"use client";

import { listCards, resolveMediaUrl } from "@/lib/offlineStore";
import { useEffect, useState } from "react";
import { Card3D } from "@/components/Card3D";

export default function HomePage() {
	const [items, setItems] = useState<Array<{ id: string; title: string; badge: string; front?: string; back?: string; status: string }>>([]);
	useEffect(() => {
		let alive = true;
		(async () => {
			const all = listCards();
			// published first
			all.sort((a, b) => (a.status === "published" ? -1 : 1) - (b.status === "published" ? -1 : 1));
			const resolved = await Promise.all(
				all.map(async (c) => ({
					id: c.id,
					title: c.title,
					badge: `${c.type} · #${c.number_no}`,
					status: c.status,
					front: await resolveMediaUrl(c.front_key) || undefined,
					back: await resolveMediaUrl(c.back_key) || undefined,
				}))
			);
			if (!alive) return;
			setItems(resolved);
		})();
		return () => { alive = false; };
	}, []);
	return (
		<div className="container">
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
				<h1 style={{ margin: 0 }}>moments.io</h1>
				<div style={{ color: "#9aa4b2" }}>Sưu tập thẻ số — MVP</div>
			</div>
			<div className="grid">
				{items.map((c) => (
					<div key={c.id} className="card-tile">
						<div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
							{c.front && c.back ? (
								<Card3D frontUrl={c.front} backUrl={c.back} width={220} height={330} badge={c.badge} title={c.title} />
							) : (
								<div style={{ width: 220, height: 330, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }} />
							)}
						</div>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<div>
								<div style={{ fontWeight: 600 }}>{c.title}</div>
								<div style={{ fontSize: 12, color: "#9aa4b2" }}>{c.badge} · {c.status}</div>
							</div>
							<a href={`/card/${c.id}`}>Xem</a>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
