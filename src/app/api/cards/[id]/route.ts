import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
	const card = await prisma.card.findUnique({ where: { id: params.id } });
	if (!card || card.status !== "published") {
		return new Response("Not Found", { status: 404 });
	}
	return Response.json(card);
}
