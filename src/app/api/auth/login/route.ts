import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { signJwt } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = loginSchema.safeParse(body);
		if (!parsed.success) {
			return Response.json({ error: "Invalid credentials" }, { status: 400 });
		}
		const { email, password } = parsed.data;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return Response.json({ error: "Invalid email or password" }, { status: 401 });
		}
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) {
			return Response.json({ error: "Invalid email or password" }, { status: 401 });
		}
		const token = signJwt({ userId: user.id, email: user.email });
		return Response.json({ token });
	} catch (e) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
