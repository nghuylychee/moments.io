import { prisma } from "@/lib/prisma";
import { cardUpdateSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
	try {
		const card = await prisma.card.findUnique({ where: { id: params.id } });
		if (!card) {
			return Response.json({ error: "Not found" }, { status: 404 });
		}
		if (card.status === "published") {
			return Response.json({ error: "Cannot edit published card" }, { status: 400 });
		}
		const body = await req.json();
		const parsed = cardUpdateSchema.safeParse(body);
		if (!parsed.success) {
			return Response.json({ error: "Invalid payload" }, { status: 400 });
		}
		const updateData: any = { ...parsed.data };
		if (parsed.data.title || parsed.data.type || parsed.data.number_no) {
			const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
			const newTitle = parsed.data.title ?? card.title;
			const newType = parsed.data.type ?? card.type;
			const newNo = parsed.data.number_no ?? card.number_no;
			const baseSlug = `${slugify(newTitle)}-${slugify(newType)}-${newNo}`;
			let slug = baseSlug;
			let attempt = 1;
			while (true) {
				const exist = await prisma.card.findUnique({ where: { slug } });
				if (!exist || exist.id === card.id) break;
				slug = `${baseSlug}-${attempt++}`;
			}
			updateData.slug = slug;
		}
		const updated = await prisma.card.update({ where: { id: card.id }, data: updateData });
		return Response.json(updated);
	} catch (e) {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
