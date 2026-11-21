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
	const { MAIL_SMTP_HOST, MAIL_SMTP_PORT, MAIL_SMTP_PASS, MAIL_SMTP_USER } = env;

	if (!MAIL_SMTP_HOST || !MAIL_SMTP_PORT || !MAIL_SMTP_USER || !MAIL_SMTP_PASS) {
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
		const port = parseInt(MAIL_SMTP_PORT, 10);
		const transporter = nodemailer.createTransport({
			host: MAIL_SMTP_HOST,
			port,
			secure: port === 465,
			auth: {
				user: MAIL_SMTP_USER,
				pass: MAIL_SMTP_PASS
			}
		});

		await transporter.sendMail({
			from: '"Contact Page - " <valance.dev>',
			to: 'arpitbaranwal05@gmail.com',
			subject: data.subject,
			text: `${data.name} (${data.email})\n\n${data.content}`
		});
		return json({
			success: true
		});
	} catch (err) {
		console.error(err);
		return json(
			{
				success: false,
				error: 'Failed to send email.'
			},
			{ status: 500 }
		);
	}
};
