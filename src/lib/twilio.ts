// src/lib/twilio.ts
import Twilio from "twilio";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_VERIFY_SID = process.env.TWILIO_VERIFY_SID || "";

if (!ACCOUNT_SID || !AUTH_TOKEN || !TWILIO_VERIFY_SID) {
  console.warn(
    "[twilio] Lipsesc variabilele de mediu TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_VERIFY_SID",
  );
}

export const twilioClient = ACCOUNT_SID && AUTH_TOKEN
  ? Twilio(ACCOUNT_SID, AUTH_TOKEN)
  : (null as unknown as ReturnType<typeof Twilio>);
