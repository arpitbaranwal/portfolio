import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface Payload {
	name: string;
	email: string;
	subject: string;
	content: string;
}

export const POST: RequestHandler = async ({ request }) => {
	const host = env.MAIL_SMTP_HOST?.trim();
	const portRaw = env.MAIL_SMTP_PORT?.trim();
	const user = env.MAIL_SMTP_USER?.trim();
	const pass = env.MAIL_SMTP_PASS?.trim();
	const toEmail = env.CONTACT_TO_EMAIL?.trim() || user;

	if (!host || !portRaw || !user || !pass) {
		return json(
			{
				success: false,
				error: 'Email service is not configured (missing SMTP environment variables).'
			},
			{ status: 503 }
		);
	}

	let data: Payload;
	try {
		data = await request.json();
	} catch {
		return json(
			{
				success: false,
				error: 'Invalid request payload.'
			},
			{ status: 400 }
		);
	}

	try {
		const port = Number(portRaw || 465);
		const transporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465,
			auth: {
				user,
				pass
			}
		});

		await transporter.sendMail({
			from: `"VALANCE Portfolio" <${user}>`,
			to: toEmail,
			replyTo: data.email,
			subject: data.subject,
			text: `${data.name} (${data.email})\n\n${data.content}`
		});

		return json({
			success: true
		});
	} catch (err) {
		console.error('[api/email]', err);
		const errorMessage = err instanceof Error ? err.message : String(err);
		return json(
			{
				success: false,
				error: import.meta.env.DEV ? `Failed to send email: ${errorMessage}` : 'Failed to send email.'
			},
			{ status: 500 }
		);
	}
};
