"use client";

import { useEffect, useState } from "react";
import { listCards, publishCard, resolveMediaUrl } from "@/lib/offlineStore";
import { Card3D } from "@/components/Card3D";

type Card = ReturnType<typeof listCards>[number];

function CardThumb({ card }: { card: Card }) {
	const [front, setFront] = useState<string | null>(null);
	const [back, setBack] = useState<string | null>(null);
	useEffect(() => {
		let alive = true;
		(async () => {
			const [f, b] = await Promise.all([
				resolveMediaUrl(card.front_key),
				resolveMediaUrl(card.back_key),
			]);
			if (!alive) return;
			setFront(f);
			setBack(b);
		})();
		return () => { alive = false; };
	}, [card.front_key, card.back_key]);
	if (!front || !back) return <div style={{ width: 220, height: 330, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }} />;
	return <Card3D frontUrl={front} backUrl={back} width={220} height={330} badge={`#${card.number_no}`} title={card.title} />;
}

export default function CreatorCardsPage() {
	const [status, setStatus] = useState<"all" | "draft" | "published">("all");
	const [items, setItems] = useState<Card[]>([]);

	function load() {
		const res = status === "all" ? listCards() : listCards({ status });
		setItems(res);
	}

	useEffect(() => { load(); }, [status]);

	function doPublish(id: string) {
		publishCard(id);
		load();
	}

	return (
		<div className="container">
			<h1>Dashboard thẻ (Offline)</h1>
			<div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
				<select value={status} onChange={(e) => setStatus(e.target.value as any)}>
					<option value="all">Tất cả</option>
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
				<button onClick={load}>Reload</button>
			</div>
			<div className="grid">
				{items.map((c) => (
					<div key={c.id} className="card-tile">
						<div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
							<CardThumb card={c} />
						</div>
						<div className="card-row">
							<div>
								<div style={{ fontWeight: 600 }}>{c.title}</div>
								<div style={{ fontSize: 12, color: "#9aa4b2" }}>{c.type} · #{c.number_no} · {c.status}</div>
							</div>
							<div>
								{c.status === "draft" ? (
									<button onClick={() => doPublish(c.id)}>Publish</button>
								) : (
									<a href={`/card/${c.id}`} target="_blank">Xem</a>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
