"use client";

import { useMemo, useState } from "react";
import { createCard } from "@/lib/offlineStore";
import { Card3D } from "@/components/Card3D";

export default function NewCardPage() {
	const [form, setForm] = useState({
		title: "",
		type: "",
		number_no: 1,
		front_image_file: undefined as File | undefined,
		back_video_file: undefined as File | undefined,
		front_image_data_url: "",
		back_video_data_url: "",
		video_duration_sec: 0,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const previewFront = form.front_image_data_url || "/window.svg";
	const previewBack = form.back_video_data_url || "/vercel.svg";

	async function onFrontChange(file?: File) {
		setError(null);
		setForm((f) => ({ ...f, front_image_file: file }));
		if (!file) {
			setForm((f) => ({ ...f, front_image_data_url: "" }));
			return;
		}
		console.log("[creator/new] front file:", file?.type, file?.size);
		const dataUrl = await fileToDataUrl(file);
		console.log("[creator/new] front dataURL length:", dataUrl.length);
		setForm((f) => ({ ...f, front_image_data_url: dataUrl }));
	}
	async function onBackChange(file?: File) {
		setError(null);
		setForm((f) => ({ ...f, back_video_file: file }));
		if (!file) {
			setForm((f) => ({ ...f, back_video_data_url: "", video_duration_sec: 0 }));
			return;
		}
		console.log("[creator/new] back file:", file?.type, file?.size);
		const dataUrl = await fileToDataUrl(file);
		console.log("[creator/new] back dataURL length:", dataUrl.length);
		const duration = await getVideoDurationFromUrl(dataUrl);
		console.log("[creator/new] measured duration:", duration);
		setForm((f) => ({ ...f, back_video_data_url: dataUrl, video_duration_sec: Math.round(duration) }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		console.log("[creator/new] submit payload:", {
			title: form.title,
			type: form.type,
			number_no: form.number_no,
			video_duration_sec: form.video_duration_sec,
			front_size: form.front_image_file?.size,
			back_size: form.back_video_file?.size,
		});
		if (!form.front_image_file || !form.back_video_file) {
			setError("Vui lòng chọn ảnh và video");
			return;
		}
		// No duration limit in preview mode
		setLoading(true);
		try {
			const card = await createCard({
				title: form.title,
				type: form.type,
				number_no: Number(form.number_no),
				front_blob: form.front_image_file,
				back_blob: form.back_video_file,
				video_duration_sec: form.video_duration_sec,
			});
			console.log("[creator/new] created card:", card);
			setSuccess(`Đã tạo thẻ draft: ${card.title}`);
			setForm({ title: "", type: "", number_no: 1, front_image_file: undefined, back_video_file: undefined, front_image_data_url: "", back_video_data_url: "", video_duration_sec: 0 });
		} catch (err: any) {
			console.error("[creator/new] create error:", err);
			setError(err.message || "Lỗi không xác định");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24 }}>
			<div>
				<h1>Tạo thẻ mới (Offline)</h1>
				<p style={{ color: "#9aa4b2" }}>Chọn ảnh mặt trước và video mặt sau</p>
				<form onSubmit={handleSubmit}>
					<label>Tên idol</label>
					<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
					<label>Loại thẻ</label>
					<input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
					<label>Số ID (number_no)</label>
					<input type="number" value={form.number_no} onChange={(e) => setForm({ ...form, number_no: Number(e.target.value) })} min={1} required />
					<label>Ảnh mặt trước</label>
					<input type="file" accept="image/*" onChange={(e) => onFrontChange(e.target.files?.[0])} required />
					<label>Video mặt sau</label>
					<input type="file" accept="video/*" onChange={(e) => onBackChange(e.target.files?.[0])} required />
					<p style={{ color: "#9aa4b2", marginTop: 6 }}>Thời lượng: {form.video_duration_sec || 0}s (preview)</p>
					<div style={{ marginTop: 12 }}>
						<button disabled={loading}>{loading ? "Đang tạo..." : "Tạo thẻ"}</button>
					</div>
				</form>
				{error && <p style={{ color: "#ef4444" }}>{error}</p>}
				{success && <p style={{ color: "#22c55e" }}>{success}</p>}
			</div>
			<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
				<Card3D frontUrl={previewFront} backUrl={previewBack} badge={form.type ? `${form.type} · #${form.number_no}` : `#${form.number_no}`} title={form.title || "Preview"} backControls />
			</div>
		</div>
	);
}

function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ""));
		reader.onerror = () => reject(reader.error || new Error("read fail"));
		reader.readAsDataURL(file);
	});
}

function getVideoDurationFromUrl(url: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		let timeout: any;
		video.preload = "metadata";
		video.onloadedmetadata = () => {
			clearTimeout(timeout);
			resolve(video.duration || 0);
		};
		video.onerror = () => {
			clearTimeout(timeout);
			reject(new Error("Không đọc được video"));
		};
		timeout = setTimeout(() => reject(new Error("Đo thời lượng quá lâu")), 10000);
		video.src = url;
	});
}
