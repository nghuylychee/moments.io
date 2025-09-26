"use client";

import { useState } from "react";
import { setToken } from "@/lib/clientApi";

export default function LoginPage() {
	const [email, setEmail] = useState("creator@example.com");
	const [password, setPassword] = useState("password123");
	const [msg, setMsg] = useState<string | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		const res = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
		const data = await res.json();
		if (res.ok) {
			setToken(data.token);
			setMsg("Đăng nhập thành công. Token đã lưu.");
		} else {
			setMsg(data.error || "Đăng nhập thất bại");
		}
	}

	return (
		<div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
			<h1>Đăng nhập (Creator)</h1>
			<form onSubmit={submit}>
				<label>Email</label>
				<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				<label>Password</label>
				<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				<div style={{ marginTop: 12 }}>
					<button>Đăng nhập</button>
				</div>
			</form>
			{msg && <p>{msg}</p>}
			<p style={{ marginTop: 12 }}>
				Sau khi đăng nhập, dùng trang <a href="/creator/new">/creator/new</a> và <a href="/creator/cards">/creator/cards</a>.
			</p>
		</div>
	);
}
