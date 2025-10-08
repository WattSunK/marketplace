import dotenv from "dotenv";
dotenv.config();

export const integrationConfig = {
  flutterwave: { type: "billing", key: process.env.FLUTTERWAVE_KEY || null },
  stripe: { type: "billing", key: process.env.STRIPE_KEY || null },
  sms_gateway: { type: "notification", key: process.env.SMS_GATEWAY_KEY || null },
  email_provider: { type: "notification", key: process.env.EMAIL_PROVIDER_KEY || null },
};

export default integrationConfig;
