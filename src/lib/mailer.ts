import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const APP_URL = process.env.FRONTEND_URL ?? 'https://vulkan-front.vercel.app';

const smtpOptions = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
} as SMTPTransport.Options;

const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport(smtpOptions)
    : null;

function welcomeEmailHtml(name: string, email: string, tempPassword: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#121212;border-radius:16px;overflow:hidden;border:1px solid #232323;">
          <tr>
            <td style="background:linear-gradient(135deg,#e8112a,#b30d20);padding:36px 40px;text-align:center;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:30px;letter-spacing:1px;color:#ffffff;">VUL<span style="color:#0a0a0a;">KAN</span></span>
              <div style="margin-top:6px;font-size:12px;letter-spacing:3px;color:rgba(255,255,255,0.85);text-transform:uppercase;">Gimnasio de Alto Rendimiento</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:22px;">¡Bienvenido a VULKAN, ${escapeHtml(name)}!</h1>
              <p style="margin:0 0 24px;color:#b5b5b5;font-size:14px;line-height:1.6;">
                Tu solicitud de inscripción fue aprobada. Ya puedes acceder al portal de miembros
                para reservar clases, revisar tu rutina y llevar el control de tu progreso.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1c1c;border-radius:10px;border:1px solid #2a2a2a;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:11px;letter-spacing:1.5px;color:#8a8a8a;text-transform:uppercase;margin-bottom:6px;">Correo</div>
                    <div style="font-size:15px;color:#ffffff;margin-bottom:16px;">${escapeHtml(email)}</div>
                    <div style="font-size:11px;letter-spacing:1.5px;color:#8a8a8a;text-transform:uppercase;margin-bottom:6px;">Contraseña temporal</div>
                    <div style="font-size:20px;color:#e8112a;font-weight:700;letter-spacing:1px;font-family:'Courier New',monospace;">${escapeHtml(tempPassword)}</div>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="border-radius:8px;background-color:#e8112a;">
                    <a href="${APP_URL}/login" style="display:inline-block;padding:14px 32px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;">
                      INICIAR SESIÓN
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#7a7a7a;font-size:12px;line-height:1.6;">
                Por seguridad, te recomendamos cambiar esta contraseña desde tu perfil apenas inicies sesión.
                Si no solicitaste esta cuenta, ignora este correo.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background-color:#0d0d0d;text-align:center;border-top:1px solid #232323;">
              <p style="margin:0;color:#5a5a5a;font-size:11px;">© ${new Date().getFullYear()} VULKAN. Forja tu fuerza, transforma tu vida.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export async function sendWelcomeEmail(to: string, name: string, tempPassword: string): Promise<boolean> {
  if (!transporter) {
    console.warn('[mailer] GMAIL_USER/GMAIL_APP_PASSWORD no configurados; correo de bienvenida no enviado.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"VULKAN Gym" <${GMAIL_USER}>`,
      to,
      subject: '¡Bienvenido a VULKAN! Tus credenciales de acceso',
      html: welcomeEmailHtml(name, to, tempPassword),
      text: `¡Bienvenido a VULKAN, ${name}!\n\nTu cuenta fue creada.\nCorreo: ${to}\nContraseña temporal: ${tempPassword}\n\nInicia sesión en ${APP_URL}/login`,
    });
    return true;
  } catch (err) {
    console.error('[mailer] Error enviando correo de bienvenida:', err);
    return false;
  }
}
