import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
	try {
		const card = await prisma.card.findUnique({ where: { id: params.id } });
		if (!card) {
			return Response.json({ error: "Not found" }, { status: 404 });
		}
		if (card.status !== "draft") {
			return Response.json({ error: "Only draft can be published" }, { status: 400 });
		}
		const updated = await prisma.card.update({
			where: { id: card.id },
			data: { status: "published", published_at: new Date() },
		});
		return Response.json(updated);
	} catch (e) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
