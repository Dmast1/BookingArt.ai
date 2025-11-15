// src/lib/email.ts
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(opts: {
  to: string;
  token: string;
}) {
  const verifyUrl = `${BASE_URL}/auth/verify?token=${encodeURIComponent(
    opts.token
  )}`;

  // TODO: заменить на реальную отправку (Resend / SendGrid / SMTP)
  console.log("=== EMAIL VERIFICATION ===");
  console.log("To:", opts.to);
  console.log("Link:", verifyUrl);
  console.log("==========================");
}
