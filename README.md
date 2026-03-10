# BirrConvert

Ethiopian Birr exchange rate dashboard — track and convert ETB against 10 major world currencies.

**Live:** https://exchange-rate-virid.vercel.app

---

## What It Does

- Fetches real exchange rates every day automatically via a cron job
- Converts between any two of 11 supported currencies
- Shows a live rates table and key currency snapshot cards
- Dark and light mode with preference saved in browser

---

## Currencies Supported

`ETB` `USD` `EUR` `GBP` `JPY` `CNY` `CAD` `AUD` `CHF` `INR` `AED`

---

## Tech Stack

| | |
|---|---|
| Backend | NestJS + MongoDB on Render |
| Frontend | HTML · CSS · Vanilla JS on Vercel |
| Data | ExchangeRate-API (daily cron fetch) |


---

## Project Structure

```
exchange-rate/
├── backend/          # NestJS API — deployed on Render
└── frontend/         # Static site — deployed on Vercel
    ├── index.html
    ├── style.css
    └── app.js
```

---

## API Endpoints

Base URL: `https://exchange-rate-mg5x.onrender.com/exchange-rate`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/today-rate` | Returns today's ETB exchange rates |
| POST | `/convert-rate` | Converts an amount between two currencies |

**Convert example:**
```json
// POST /convert-rate
{ "fromCurrency": "USD", "toCurrency": "ETB", "amount": 100 }

// Response
{ "fromCurrency": "USD", "toCurrency": "ETB", "Amount": 12468.83 }
```

## Deployment

| Service | What |
|---|---|
| [Render](https://render.com) | Hosts the NestJS backend |
| [Vercel](https://vercel.com) | Hosts the static frontend |

`vercel.json` in the project root tells Vercel to serve from the `frontend/` folder.

