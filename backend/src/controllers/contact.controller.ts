import type { Request, Response } from "express";
import axios from "axios";

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const contactController = {
  async send(req: Request, res: Response) {
    const { name, email, subject, message } = (req as any).validated;

    const apiKey = process.env.BREVO_API_KEY;
    const toEmail = process.env.CONTACT_FORM_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL;
    const fromName = process.env.CONTACT_FORM_FROM_NAME ?? "Flacron Gamezone";

    if (!apiKey || !toEmail || !fromEmail) {
      throw Object.assign(
        new Error("Contact form is not configured on the server."),
        { status: 500 },
      );
    }

    const safeName = escapeHtml(name);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: toEmail }],
        replyTo: { email, name }, 
        subject: `[Contact Form] ${safeSubject}`,
        htmlContent: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
              ${safeMessage}
            </div>
          </div>
        `,
        textContent: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({ success: true });
  },
};
