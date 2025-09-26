export type JwtPayload = { userId: string; email: string };

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signJwt(payload: JwtPayload, expiresIn = "7d"): string {
	const jwt = require("jsonwebtoken");
	return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload | null {
	const jwt = require("jsonwebtoken");
	try {
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		return null;
	}
}

export function getBearerToken(req: Request): string | null {
	const auth = req.headers.get("authorization") || "";
	if (!auth.toLowerCase().startsWith("bearer ")) return null;
	return auth.slice(7);
}

export function requireAuth(req: Request): JwtPayload | Response {
	const token = getBearerToken(req);
	if (!token) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "content-type": "application/json" },
		});
	}
	const payload = verifyJwt(token);
	if (!payload) {
		return new Response(JSON.stringify({ error: "Invalid token" }), {
			status: 401,
			headers: { "content-type": "application/json" },
		});
	}
	return payload;
}
