Option A — Deploy Frontend to Vercel and Backend to Render/Heroku

Overview
- Frontend: React app in `frontend/` deployed to Vercel (recommended for static + CRA).
- Backend: Express app in `backend/` deployed to Render or Heroku as a Web Service.

Prepare the repo
1. Commit all changes and push to your GitHub repository:

   git add .
   git commit -m "Prepare for deploy: env-config, Procfile, deploy guide"
   git push

Backend (Render) — quick steps
1. Create account at https://render.com and connect your GitHub account.
2. Create a new "Web Service".
   - Build Command: `npm install` (or leave blank to use Render's defaults)
   - Start Command: `npm start`
   - Root: choose the `backend/` folder in the repo.
3. Set environment variables in Render service settings:
   - `GOOGLE_API_KEY` = <your Google Generative AI key>
   - `NODE_ENV` = production
   - `GOOGLE_MODEL` = (optional) e.g. gemini-2.5-flash
   - `ALLOWED_ORIGINS` = https://<your-vercel-frontend>.vercel.app (comma-separated list)
   - `TRUST_PROXY` = true (if Render places your app behind a proxy) or leave unset if unsure.
4. Deploy and wait for Render to provide a stable URL (e.g., https://law-backend.onrender.com).

Backend (Heroku) — alternative
1. Create Heroku app and deploy the `backend` folder (use Heroku Git or GitHub integration).
2. Add config vars (same env names as above).
3. Ensure `backend/Procfile` exists (we added `web: npm start`).

Frontend (Vercel)
1. Create an account at https://vercel.com and link your GitHub repo.
2. Create a new project and set the Project Root to the `frontend/` folder.
3. Set Environment Variables in Vercel (Project Settings → Environment Variables):
   - `REACT_APP_API_URL` = https://law-backend.onrender.com  (use your actual backend URL)
4. Vercel will detect Create React App. Build command: `npm run build`, Output directory: `build`.
5. Deploy and wait for frontend URL (e.g., https://law-help-frontend.vercel.app).

Local testing (before or after deploy)
- Start backend locally:

  cd backend
  npm install
  npm run dev

- Start frontend locally (in a new terminal):

  cd frontend
  npm install
  npm start

- If deployed backend url is `https://law-backend.onrender.com`, set in `.env.local` in `frontend/` for local dev:

  REACT_APP_API_URL=https://law-backend.onrender.com

Security notes
- Never commit your API keys to the repo. Use each host's environment variable management.
- For `GOOGLE_API_KEY`, restrict usage in Google Cloud to the services and IPs you need.
- Monitor logs on Render/Heroku and Vercel for 404s or AI model errors.

Troubleshooting
- If frontend reports CORS: ensure `ALLOWED_ORIGINS` in backend contains your frontend origin.
- If backend logs show `ERR_ERL_PERMISSIVE_TRUST_PROXY`, set `TRUST_PROXY` to the appropriate value per your host (Render: `true` usually OK when combined with rate-limit key setup).
- If Google API returns 404 for a model, try setting `GOOGLE_MODEL` to a supported model (contact Google or use `ModelService.ListModels`).

Want me to:
- Create the Render and Vercel config files and perform the first push?
- Or walk you interactively through the Render/Vercel dashboards and variables?
