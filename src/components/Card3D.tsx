"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

export function Card3D(props: {
	frontUrl: string;
	backUrl: string;
	width?: number;
	height?: number;
	badge?: string;
	title?: string;
	backControls?: boolean;
}) {
	const { frontUrl, backUrl, width = 360, height = 540, badge, title, backControls = false } = props;
	const innerRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [flipped, setFlipped] = useState(false);

	function onMove(e: React.MouseEvent) {
		const el = innerRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const px = (e.clientX - rect.left) / rect.width;
		const py = (e.clientY - rect.top) / rect.height;
		const rx = (py - 0.5) * -12;
		const ry = (px - 0.5) * 12;
		el.style.setProperty("--rx", `${rx}deg`);
		el.style.setProperty("--ry", `${ry}deg`);
		el.style.setProperty("--shine-x", `${px * 100}%`);
		el.style.setProperty("--shine-y", `${py * 100}%`);
	}
	function onLeave() {
		const el = innerRef.current;
		if (!el) return;
		el.style.setProperty("--rx", `0deg`);
		el.style.setProperty("--ry", `0deg`);
	}
	function onClick() {
		setFlipped((prev) => !prev);
	}

	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		if (flipped) {
			v.currentTime = 0;
			v.play().catch(() => {});
		} else {
			v.pause();
			v.currentTime = 0;
		}
	}, [flipped]);

	return (
		<div className="card3d" style={{ ['--w' as any]: `${width}px`, ['--h' as any]: `${height}px` }} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick}>
			<div className="card3d-inner" ref={innerRef} data-flipped={flipped ? "true" : "false"}>
				<div className="card3d-face card3d-front" style={{ position: "relative" }}>
					{badge && <div className="badge">{badge}</div>}
					<Image src={frontUrl} alt={title || "front"} width={width} height={height} style={{ objectFit: "cover", width, height }} />
					<div style={{ position: "absolute", inset: 0, background: "radial-gradient(240px 240px at var(--shine-x,50%) var(--shine-y,50%), rgba(255,255,255,0.15), transparent 40%)", mixBlendMode: "overlay", pointerEvents: "none" }} />
				</div>
				<div className="card3d-face card3d-back">
					<video ref={videoRef} src={backUrl} playsInline controls={backControls} style={{ width, height, objectFit: "cover" }} />
				</div>
			</div>
		</div>
	);
}
