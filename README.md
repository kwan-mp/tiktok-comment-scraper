# Tiktok Comments Scraper

> **⚠️ Known issue: the backend scraper no longer works.**
> `backend/script2.py` calls TikTok's private comment API with hardcoded
> signing tokens (`msToken`/`X-Bogus`/`_signature`) that are long expired.
> TikTok now validates these against a live, non-automated browser session,
> so this fails whether you refresh the tokens, replay the request with a
> plain HTTP client, or drive a headless/automated browser (e.g.
> Playwright/Selenium) — all were tested and blocked.
>
> A working alternative that runs entirely in your own browser (no backend
> needed) is provided in [`tools/extract-comments.js`](tools/extract-comments.js) —
> see the usage comment at the top of that file.

## Overview

This project is built using Python and React

## Features

- Get comments from any Tiktok Url.
- Python Flask for backend API.
- Axios, React-toast, tailwind css for frontend

## Installation and Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/kavindu-udara/tiktok-comment-scraper.git
   ```

2. Navigate to the project directory:

   ```bash
   cd tiktok-comment-scraper
   ```

3. Setup Backend:

   ```bash
   cd backend
   pyhton -m venv .venv
   source .venv/bin/activate # On Windows use `.venv\Scripts\activate`
   pip install -r requirements.txt
   copy .env.example .env
   python app.py 
   ```

4. Setup Frontend:

   ```bash
   cd frontend
   npm install
   copy .env.example .env
   npm run dev
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements, bug fixes, or feature requests.