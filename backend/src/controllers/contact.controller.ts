import type { Request, Response } from "express";
import axios from "axios";

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

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: toEmail }],
        replyTo: { email, name },
        subject: `[Contact Form] ${subject}`,
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
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
