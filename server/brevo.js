require('dotenv').config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

if (!BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY must be set in .env');
}

async function sendConfirmationEmail({ toEmail, toName, confirmToken, type }) {
  let subject, htmlContent;

  if (type === 'student' || type === 'schueler') {
    subject = 'Bitte bestätige deine E-Mail-Adresse – 19sx Warteliste';
    htmlContent = studentConfirmationTemplate(confirmToken, toName);
  } else if (type === 'kmu' || type === 'company') {
    subject = 'Bitte bestätigen Sie Ihre E-Mail-Adresse – 19sx Warteliste';
    htmlContent = companyConfirmationTemplate(confirmToken, toName);
  } else if (type === 'parent') {
    subject = 'Bitte bestätigen Sie die E-Mail-Adresse Ihres Kindes – 19sx Warteliste';
    htmlContent = parentConfirmationTemplate(confirmToken, toName);
  } else {
    throw new Error(`Unknown confirmation type: ${type}`);
  }

  const payload = {
    sender: { name: '19sx Warteliste', email: 'noreply@19sx.io' },
    to: [{ email: toEmail, name: toName }],
    subject,
    htmlContent,
  };

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${errBody}`);
  }

  return res.json();
}

function studentConfirmationTemplate(token, name) {
  const link = `${process.env.BASE_URL || 'http://localhost:3000'}/confirm?token=${token}`;
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #000;">Hallo ${escapeHtml(name)},</h2>
  <p>vielen Dank für dein Interesse an der 19sx Warteliste!</p>
  <p>Um deine Anmeldung abzuschließen, bestätige bitte deine E-Mail-Adresse mit einem Klick auf den folgenden Button:</p>
  <p style="text-align: center;">
    <a href="${link}" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">E-Mail bestätigen</a>
  </p>
  <p style="margin-top: 20px;">Oder kopiere diesen Link in deinen Browser:</p>
  <p style="color: #666; word-break: break-all;">${link}</p>
  <p style="margin-top: 30px; color: #999; font-size: 12px;">Falls du dich nicht angemeldet hast, ignoriere diese E-Mail einfach. Der Link ist 7 Tage gültig.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">19sx – Datenschutzkonform nach DSGVO. Deine Daten werden erst nach Bestätigung gespeichert.</p>
</body>
</html>`;
}

function parentConfirmationTemplate(token, parentName) {
  const link = `${process.env.BASE_URL || 'http://localhost:3000'}/confirm?token=${token}`;
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #000;">Hallo ${escapeHtml(parentName)},</h2>
  <p>Ihr Kind möchte sich für die 19sx Warteliste anmelden. Da das Kind unter 16 Jahre alt ist, benötigen wir Ihre elterliche Zustimmung.</p>
  <p>Bitte bestätigen Sie die Anmeldung mit einem Klick auf den folgenden Button:</p>
  <p style="text-align: center;">
    <a href="${link}" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">Anmeldung bestätigen</a>
  </p>
  <p style="margin-top: 20px;">Oder kopieren Sie diesen Link in Ihren Browser:</p>
  <p style="color: #666; word-break: break-all;">${link}</p>
  <p style="margin-top: 30px; color: #999; font-size: 12px;">Falls Sie keine Anmeldung vorgenommen haben, ignorieren Sie diese E-Mail bitte. Der Link ist 7 Tage gültig.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">19sx – Datenschutzkonform nach DSGVO. Die Daten werden erst nach Bestätigung gespeichert.</p>
</body>
</html>`;
}

function companyConfirmationTemplate(token, name) {
  const link = `${process.env.BASE_URL || 'http://localhost:3000'}/confirm?token=${token}`;
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #000;">Hallo ${escapeHtml(name)},</h2>
  <p>vielen Dank für Ihr Interesse an der 19sx Warteliste für Unternehmen!</p>
  <p>Um Ihre Anmeldung abzuschließen, bestätigen Sie bitte Ihre E-Mail-Adresse mit einem Klick auf den folgenden Button:</p>
  <p style="text-align: center;">
    <a href="${link}" style="display: inline-block; background: #000; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">E-Mail bestätigen</a>
  </p>
  <p style="margin-top: 20px;">Oder kopieren Sie diesen Link in Ihren Browser:</p>
  <p style="color: #666; word-break: break-all;">${link}</p>
  <p style="margin-top: 30px; color: #999; font-size: 12px;">Falls Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail bitte. Der Link ist 7 Tage gültig.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">19sx – Datenschutzkonform nach DSGVO. Ihre Daten werden erst nach Bestätigung gespeichert.</p>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { sendConfirmationEmail };
