import { prisma } from "@/lib/prisma";
import { cardCreateSchema } from "@/lib/validation";

function slugify(input: string) {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = cardCreateSchema.safeParse(body);
		if (!parsed.success) {
			return Response.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
		}
		const { title, type, number_no, front_image_url, back_video_url, video_duration_sec } = parsed.data;
		const baseSlug = `${slugify(title)}-${slugify(type)}-${number_no}`;
		let slug = baseSlug;
		let attempt = 1;
		while (await prisma.card.findUnique({ where: { slug } })) {
			slug = `${baseSlug}-${attempt++}`;
		}
		const card = await prisma.card.create({
			data: {
				title,
				type,
				number_no,
				front_image_url,
				back_video_url,
				video_duration_sec,
				status: "draft",
				created_by: "anonymous",
				slug,
			},
		});
		return Response.json(card, { status: 201 });
	} catch (e: any) {
		console.error("POST /api/creator/cards error", e);
		return Response.json({ error: "Server error", message: e?.message }, { status: 500 });
	}
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const status = searchParams.get("status") as "draft" | "published" | null;
	const page = Number(searchParams.get("page") || 1);
	const pageSize = Math.min(50, Number(searchParams.get("pageSize") || 20));
	const where: any = {};
	if (status) where.status = status;
	const [items, total] = await Promise.all([
		prisma.card.findMany({ where, orderBy: { created_at: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
		prisma.card.count({ where }),
	]);
	return Response.json({ items, page, pageSize, total });
}
