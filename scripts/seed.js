const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
	const prisma = new PrismaClient();
	const email = process.env.SEED_EMAIL || "creator@example.com";
	const password = process.env.SEED_PASSWORD || "password123";
	const passwordHash = await bcrypt.hash(password, 10);
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		console.log("User already exists:", email);
		await prisma.$disconnect();
		return;
	}
	await prisma.user.create({ data: { email, passwordHash } });
	console.log("Seeded user:", email, "password:", password);
	await prisma.$disconnect();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
