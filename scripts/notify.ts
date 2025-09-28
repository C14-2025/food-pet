#!/usr/bin/env -S node
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

type Env = {
  SMTP_HOST?: string;
  SMTP_PORT?: string; // ex.: "587" ou "465"
  SMTP_USER?: string; // ex.: seuemail@gmail.com
  SMTP_PASS?: string; // App Password do Gmail (não a senha normal)
  EMAIL_TO?: string;
  SUBJECT?: string;
  TEST_STATUS?: string;
  MESSAGE_FILE?: string;
};

function requireEnv(name: keyof Env, env: Env) {
  const v = env[name];
  if (!v) throw new Error(`Missing required env: ${String(name)}`);
  return v;
}

async function main() {
  const env = process.env as Env;

  const host = requireEnv('SMTP_HOST', env);
  const port = Number(env.SMTP_PORT || '587');
  const user = requireEnv('SMTP_USER', env);
  const pass = requireEnv('SMTP_PASS', env);
  const to = requireEnv('EMAIL_TO', env);

  const status = env.TEST_STATUS ?? 'unknown';
  const subject = env.SUBJECT || `CI Notification: tests=${status}`;
  const msgFile = env.MESSAGE_FILE || 'notify-message.txt';

  const filePath = path.resolve(msgFile);
  const text = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : `Pipeline executado. Status dos testes: ${status}`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true p/ 465 (SSL), false p/ 587/25 (STARTTLS)
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: user,
    to: to,
    subject,
    text,
  });

  console.log(`[notify] Email sent: ${info.messageId}`);
}

main().catch((err) => {
  console.error('[notify] Failed to send email:', err);
  // Se quiser que o job falhe quando o envio falhar, descomente:
  // process.exit(1);
});
