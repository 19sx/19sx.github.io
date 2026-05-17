require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./supabase');
const { sendConfirmationEmail } = require('./brevo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('19sx Double Opt-In API');
});

app.get('/confirm', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send(renderConfirmPage('error', 'Kein Token angegeben.'));
  }

  const { data: signup, error } = await supabase
    .from('signups')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !signup) {
    return res.status(404).send(renderConfirmPage('error', 'Token nicht gefunden oder ungültig.'));
  }

  if (signup.status === 'confirmed') {
    return res.send(renderConfirmPage('success', 'Deine E-Mail wurde bereits bestätigt. Du bist auf der Warteliste!'));
  }

  if (new Date(signup.expires_at) < new Date()) {
    return res.status(410).send(renderConfirmPage('expired', 'Der Bestätigungslink ist abgelaufen. Bitte melde dich erneut an.'));
  }

  const { error: updateError } = await supabase
    .from('signups')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('token', token);

  if (updateError) {
    console.error('Confirm update error:', updateError);
    return res.status(500).send(renderConfirmPage('error', 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'));
  }

  res.send(renderConfirmPage('success', 'Deine E-Mail-Adresse wurde erfolgreich bestätigt! Du bist jetzt auf der Warteliste.'));
});

function renderConfirmPage(type, message) {
  const icon = type === 'success' ? '✅' : type === 'expired' ? '⏰' : '❌';
  const title = type === 'success' ? 'Bestätigung erfolgreich' : type === 'expired' ? 'Link abgelaufen' : 'Fehler';
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} – 19sx</title>
  <style>
    body {
      font-family: "SF Pro Display", "Inter", -apple-system, sans-serif;
      background: #fbfbfd;
      color: #1d1d1f;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    .card {
      background: #fff;
      padding: 48px;
      border-radius: 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      max-width: 420px;
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 12px; }
    p { color: #6e6e73; font-size: 16px; line-height: 1.5; }
    a { color: #0071e3; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p style="margin-top: 24px; font-size: 14px;"><a href="/">← Zurück zur 19sx Seite</a></p>
  </div>
</body>
</html>`;
}

app.post('/api/signup/student', async (req, res) => {
  try {
    const { name, email, city, skill, age_group, parent_email, consent } = req.body;

    if (!name || !email || !city || !consent) {
      return res.status(400).json({ success: false, message: 'Bitte fülle alle Pflichtfelder aus.' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Bitte gib eine gültige E-Mail-Adresse an.' });
    }

    if (age_group === 'under_16' && !parent_email) {
      return res.status(400).json({ success: false, message: 'Für Schüler unter 16 ist die E-Mail der Eltern erforderlich.' });
    }

    const confirmEmail = age_group === 'under_16' ? parent_email : email;
    const confirmName = age_group === 'under_16' ? `Eltern von ${name}` : name;

    const { data: signup, error } = await supabase
      .from('signups')
      .insert({
        type: 'student',
        status: 'pending',
        name,
        email,
        city,
        skill: skill || null,
        age_group: age_group || null,
        parent_email: parent_email || null,
        consent: !!consent,
        confirm_email: confirmEmail,
      })
      .select('token')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ success: false, message: 'Datenbankfehler. Bitte versuche es später erneut.' });
    }

    const emailType = age_group === 'under_16' ? 'parent' : 'student';
    await sendConfirmationEmail({
      toEmail: confirmEmail,
      toName: confirmName,
      confirmToken: signup.token,
      type: emailType,
    });

    return res.json({ success: true, message: 'Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine E-Mail geschickt.' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' });
  }
});

app.post('/api/signup/company', async (req, res) => {
  try {
    const { company, email, city, company_type, consent } = req.body;

    if (!company || !email || !city || !consent) {
      return res.status(400).json({ success: false, message: 'Bitte fülle alle Pflichtfelder aus.' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Bitte gib eine gültige E-Mail-Adresse an.' });
    }

    const { data: signup, error } = await supabase
      .from('signups')
      .insert({
        type: 'kmu',
        status: 'pending',
        company,
        email,
        city,
        company_type: company_type || null,
        consent: !!consent,
        confirm_email: email,
      })
      .select('token')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ success: false, message: 'Datenbankfehler. Bitte versuche es später erneut.' });
    }

    await sendConfirmationEmail({
      toEmail: email,
      toName: company,
      confirmToken: signup.token,
      type: 'kmu',
    });

    return res.json({ success: true, message: 'Bitte bestätigen Sie Ihre E-Mail-Adresse. Wir haben Ihnen eine E-Mail geschickt.' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' });
  }
});

app.listen(PORT, () => {
  console.log(`19sx Double Opt-In API running on port ${PORT}`);
});
