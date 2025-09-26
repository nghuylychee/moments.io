import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
	title: "moments.io",
	description: "Digital card MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(10,11,15,0.8)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
					<div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<Link href="/" style={{ fontWeight: 700, letterSpacing: 0.6 }}>moments.io</Link>
						<nav style={{ display: "flex", gap: 12 }}>
							<Link href="/creator/new">Tạo thẻ</Link>
							<Link href="/creator/cards">Dashboard</Link>
						</nav>
					</div>
				</header>
				<main className="container">{children}</main>
			</body>
		</html>
	);
}
