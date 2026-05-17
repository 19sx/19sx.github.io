# 19sx Double Opt-In Backend

## Setup

### 1. Supabase
1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Kopiere `migration.sql` in den SQL Editor und führe es aus
3. Notiere `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` aus den Settings → API

### 2. Brevo (Sendinblue)
1. Gehe zu [Brevo SMTP & API](https://app.brevo.com/settings/keys/smtp)
2. Erstelle oder kopiere den SMTP API Key
3. Optional: Richte eine Absender-Adresse ein (noreply@deine-domain.de)

### 3. Server konfigurieren
```bash
cp .env.example .env
# Trage BREVO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BASE_URL ein
```

### 4. Starten
```bash
npm install
npm start   # Produktion
npm run dev # Entwicklung (mit --watch)
```

### 5. DigitalOcean Deployment
```bash
# Auf deinem Droplet:
git clone https://github.com/19sx/19sx.github.io.git
cd 19sx.github.io/server
npm install
cp .env.example .env   # Keys eintragen!
# Via PM2:
npm install -g pm2
pm2 start index.js --name 19sx-doi
pm2 save
pm2 startup
```

### API Endpunkte
- `POST /api/signup/student` — Schüler-Anmeldung
- `POST /api/signup/company` — KMU-Anmeldung
- `GET /confirm?token=xyz` — Double Opt-In Bestätigung

### DSGVO
- Daten werden mit Status `pending` gespeichert (zulässig für DOI)
- Erst nach Bestätigung (`confirmed`) gelten sie als gültig
- Unbestätigte Einträge verfallen nach 7 Tagen (Cleanup via Supabase)

### Sichere deinen API Key!
⚠️ Falls der Brevo Key jemals im Chat oder Code öffentlich war, sofort in Brevo widerrufen und neu generieren.
Der Key gehört nur in `.env` auf dem Server — niemals im Frontend oder Git.
