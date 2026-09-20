# Alex Morgan Portfolio

A responsive, three-tier portfolio starter with a React frontend, Express API, and SQLite database.

## Run locally

Open two terminals from the project root:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173. The API runs at http://localhost:4000.

## Data flow

- `backend/server.js` creates and seeds `backend/data/portfolio.db`.
- `GET /api/portfolio` feeds the public React page.
- `PUT /api/portfolio` updates the stored portfolio record.
- The `Edit portfolio content` control demonstrates a database-backed intro update. Extend the same payload pattern for projects, services, social links, and profile fields.

Set `VITE_API_URL` if the API is hosted elsewhere, for example `VITE_API_URL=https://api.example.com/api`.
