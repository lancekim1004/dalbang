// 메일 보내기는 이 파일에서만 한다 (CLAUDE.md 규칙). 지금은 Gmail SMTP + Nodemailer.
// 나중에 Resend 등으로 바꾸려면 sendMail() 안쪽만 고치면 된다.
import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

export class MailNotConfiguredError extends Error {
  constructor() {
    super("Mail is not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing).");
  }
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new MailNotConfiguredError();
  transporter ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(msg: MailMessage): Promise<void> {
  const t = getTransporter();
  await t.sendMail({ from: { name: "Dalbang", address: process.env.GMAIL_USER! }, ...msg });
}
