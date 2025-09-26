export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { fileName, contentType } = body || {};
		if (!fileName || !contentType) {
			return Response.json({ error: "fileName and contentType required" }, { status: 400 });
		}
		const publicUrl = `https://cdn.local/${encodeURIComponent(fileName)}`;
		const url = `https://upload.local/presigned?name=${encodeURIComponent(fileName)}&type=${encodeURIComponent(contentType)}`;
		return Response.json({ url, publicUrl });
	} catch {
		return Response.json({ error: "Server error" }, { status: 500 });
	}
}
