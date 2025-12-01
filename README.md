# 🎓 Skool Scraper SaaS

Un mini SaaS moderno e intuitivo per lo scraping e l'analisi intelligente di gruppi Skool. Estrae tutto il contenuto da qualsiasi gruppo Skool (lezioni, discussioni, post) e genera riassunti e report dettagliati usando l'AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

## ✨ Caratteristiche

- 🚀 **Scraping Veloce**: Utilizza Apify per estrarre migliaia di elementi da gruppi Skool
- 🤖 **Analisi AI**: Genera riassunti intelligenti e report dettagliati con OpenAI
- 📊 **Dashboard Intuitiva**: Interfaccia moderna e facile da usare
- 💾 **Storico Completo**: Salva tutti gli scraping e riassunti in un database locale
- 🎯 **Multi-Topic**: Funziona con qualsiasi tipo di gruppo (cucina, marketing, survival, etc.)
- ⚡ **Deploy Facile**: Pronto per il deploy su fly.io senza Docker

## 📋 Prerequisiti

- Node.js 18 o superiore
- Account [Apify](https://apify.com/) (per lo scraping)
- API Key [OpenAI](https://platform.openai.com/) (per i riassunti AI)

## 🚀 Installazione

### 1. Clona la repository

```bash
git clone https://github.com/maru-mm/skool-scraper.git
cd skool-scraper
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto:

```env
# Apify API Token (Richiesto)
APIFY_TOKEN=your_apify_token_here

# OpenAI API Key (Richiesto)
OPENAI_API_KEY=your_openai_api_key_here

# Configurazione Server (Opzionale)
PORT=3000
NODE_ENV=development
```

**Come ottenere le API Keys:**

- **Apify Token**: 
  1. Registrati su [apify.com](https://apify.com/)
  2. Vai su Settings → Integrations → API tokens
  3. Crea un nuovo token

- **OpenAI API Key**:
  1. Registrati su [platform.openai.com](https://platform.openai.com/)
  2. Vai su API keys
  3. Crea una nuova chiave segreta

### 4. Crea la cartella per il database

```bash
mkdir data
```

## 💻 Utilizzo

### Sviluppo

Avvia il server di sviluppo (backend + frontend):

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Produzione

Build e avvio in produzione:

```bash
npm run build
npm start
```

## 📦 Deploy su fly.io

### 1. Installa fly.io CLI

```bash
# macOS
brew install flyctl

# Altri sistemi: https://fly.io/docs/hands-on/install-flyctl/
```

### 2. Login su fly.io

```bash
fly auth login
```

### 3. Crea il volume per i dati

```bash
fly volumes create data --region fra --size 1
```

### 4. Imposta i secrets

```bash
fly secrets set APIFY_TOKEN=your_apify_token
fly secrets set OPENAI_API_KEY=your_openai_key
```

### 5. Deploy!

```bash
fly deploy
```

La tua app sarà disponibile su `https://tuo-nome-app.fly.dev`

## 🎯 Come Usare

1. **Inserisci l'URL**: Copia l'URL del gruppo Skool che vuoi analizzare
2. **Seleziona le Opzioni**: Scegli la sezione (Classroom, Community, etc.)
3. **Avvia lo Scraping**: Clicca su "Inizia Scraping"
4. **Attendi il Completamento**: Il sistema estrae tutti i dati
5. **Genera il Riassunto**: Clicca su "Genera Riassunto" per l'analisi AI
6. **Visualizza i Risultati**: Leggi il riassunto, i punti chiave e gli insights

## 📁 Struttura del Progetto

```
skool-scraper/
├── server/                 # Backend Node.js
│   ├── index.js           # Entry point server
│   ├── db/                # Database SQLite
│   │   └── database.js    # Setup DB
│   ├── routes/            # API Routes
│   │   ├── scraper.js     # Endpoint scraping
│   │   ├── summary.js     # Endpoint AI
│   │   └── history.js     # Endpoint cronologia
│   └── services/          # Business logic
│       ├── apifyService.js    # Integrazione Apify
│       └── aiService.js       # Integrazione OpenAI
├── src/                   # Frontend React
│   ├── components/        # Componenti UI
│   │   ├── Header.jsx
│   │   ├── ScraperForm.jsx
│   │   ├── StatusDisplay.jsx
│   │   ├── SummaryDisplay.jsx
│   │   └── History.jsx
│   ├── App.jsx           # Componente principale
│   ├── main.jsx          # Entry point
│   └── index.css         # Stili globali
├── data/                 # Database SQLite (creato automaticamente)
├── package.json          # Dipendenze
├── vite.config.js        # Configurazione Vite
├── fly.toml              # Configurazione fly.io
└── README.md             # Questo file
```

## 🛠️ API Endpoints

### Scraping

- `POST /api/scraper/start` - Avvia un nuovo scraping
- `GET /api/scraper/status/:scrapeId` - Verifica lo stato
- `GET /api/scraper/items/:scrapeId` - Ottieni i dati scrapati

### AI Summary

- `POST /api/summary/generate/:scrapeId` - Genera un riassunto
- `GET /api/summary/:summaryId` - Ottieni un riassunto
- `POST /api/summary/report/:scrapeId` - Genera un report completo

### History

- `GET /api/history` - Lista tutti gli scraping
- `DELETE /api/history/:scrapeId` - Elimina uno scraping

### Health

- `GET /api/health` - Verifica stato server

## 🔧 Tecnologie Utilizzate

### Backend
- **Node.js** + **Express** - Server e API
- **Apify Client** - Scraping di Skool
- **OpenAI API** - Generazione riassunti
- **JSON File Storage** - Storage semplice e affidabile

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool ultra-veloce
- **CSS3** - Styling moderno con gradients

### Deploy
- **Fly.io** - Hosting e deploy automatico
- **Docker** - Build ottimizzato multi-stage

## 💡 Tips & Best Practices

- **Limiti Apify**: Controlla i limiti del tuo piano Apify
- **Costi OpenAI**: I riassunti usano GPT-4o-mini per ottimizzare i costi
- **Database**: Il database SQLite è locale, considera un backup per produzione
- **Rate Limiting**: Implementa rate limiting in produzione per evitare abusi

## 🐛 Troubleshooting

### Errore "Scraping failed"
- Verifica che il tuo APIFY_TOKEN sia valido
- Controlla che l'URL Skool sia corretto e pubblico

### Errore "Summary generation failed"
- Verifica che la tua OPENAI_API_KEY sia valida
- Controlla di avere crediti disponibili su OpenAI

### Database locked
- Chiudi tutte le connessioni al database
- Riavvia il server

## 📝 TODO / Roadmap

- [ ] Aggiungere supporto per download PDF dei report
- [ ] Implementare autenticazione utenti
- [ ] Aggiungere grafici e statistiche
- [ ] Supporto per scraping multipli in parallelo
- [ ] Integrazione con altri LLM (Claude, Gemini)
- [ ] Export in formato Markdown

## 🤝 Contribuire

Le pull request sono benvenute! Per modifiche importanti, apri prima un issue per discutere i cambiamenti.

## 📄 Licenza

MIT License - vedi file LICENSE per dettagli

## 👤 Autore

**Maru**
- GitHub: [@maru-mm](https://github.com/maru-mm)

## 🙏 Credits

- [Apify](https://apify.com/) per il servizio di scraping
- [OpenAI](https://openai.com/) per l'API GPT
- [Skool](https://skool.com/) per la piattaforma

---

⭐ Se questo progetto ti è stato utile, lascia una stella su GitHub!

