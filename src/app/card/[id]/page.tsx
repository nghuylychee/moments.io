"use client";

import { Card3D } from "@/components/Card3D";
import { getCardMeta, resolveMediaUrl } from "@/lib/offlineStore";
import React, { useEffect, useState, use as usePromise } from "react";

export default function PublicCardPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = usePromise(params);
	const [state, setState] = useState<{ ok: boolean; front?: string; back?: string; badge?: string; title?: string } | null>(null);
	useEffect(() => {
		(async () => {
			const meta = getCardMeta(id);
			if (!meta || meta.status !== "published") {
				setState({ ok: false });
				return;
			}
			const [front, back] = await Promise.all([resolveMediaUrl(meta.front_key), resolveMediaUrl(meta.back_key)]);
			if (!front || !back) {
				setState({ ok: false });
				return;
			}
			setState({ ok: true, front, back, badge: `${meta.type} · #${meta.number_no}`, title: meta.title });
		})();
	}, [id]);
	if (!state) return null;
	if (!state.ok) return <div className="container"><h1>404</h1><p>Thẻ không tồn tại hoặc chưa publish.</p></div>;
	return (
		<div className="container" style={{ display: "flex", justifyContent: "center" }}>
			<Card3D frontUrl={state.front!} backUrl={state.back!} badge={state.badge} title={state.title} backControls />
		</div>
	);
}
