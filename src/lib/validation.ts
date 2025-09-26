import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const cardBaseSchema = z.object({
	title: z.string().min(1),
	type: z.string().min(1),
	number_no: z.number().int().positive(),
	front_image_url: z.string().url(),
	back_video_url: z.string().url(),
	video_duration_sec: z.number().int().min(0).max(15),
});

export const cardCreateSchema = cardBaseSchema;

export const cardUpdateSchema = cardBaseSchema.partial();
