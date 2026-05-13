# 🌌 APOD Daily Data Extractor

Welcome to the **APOD Daily Data Extractor** documentation! This project is designed to fetch, consolidate, and serve Astronomy Picture of the Day (APOD) data locally using a lightweight JSON server.

---

## 📌 Overview

The application automates the process of extracting daily data from an external APOD API (`https://apod.ellanan.com/api`), storing it into local JSON files, and serving that data via a REST API using `json-server`. It has historical data spanning thousands of days stored locally and allows you to easily run an API to access this historical data.

---

## 🚀 Features

- **Data Extraction**: Scripts written in both Node.js and Python to fetch the latest APOD data.
- **Data Consolidation**: Appends daily entries into a single, unified local JSON database (`consolidated.json` and `extracted_data.json`).
- **Local REST API**: Quickly serves the consolidated historical data as a RESTful API using `json-server`.
- **Docker Support**: Fully containerized setup for seamless, reproducible environments.
- **Vercel Ready**: Includes `vercel.json` for easy cloud deployment with configured CORS headers.

---

## 🛠️ Technology Stack

- **JavaScript / Node.js**: Core extraction logic and custom server routing.
- **Python**: Alternative extraction script.
- **json-server**: For serving the local JSON database via a REST API.
- **Docker & Docker Compose**: For containerization and easy deployment.

---

## 📂 Project Structure

A brief overview of the critical files and directories in the repository:

- `src/index.js` - Node.js script that fetches new APOD data and appends it to `extracted_data.json`.
- `src/server.js` - A custom `json-server` implementation that serves `consolidated.json`.
- `src/basic.py` - Python script equivalent to `index.js`, but it updates `consolidated.json` directly.
- `extracted_data/` - A directory containing thousands of historical APOD responses split by day (e.g., `1995-06-16.json`).
- `consolidated.json` & `extracted_data.json` - Massive JSON files containing the accumulated APOD data.
- `Dockerfile` & `docker-compose.yml` - Configuration files to run the `json-server` in a Docker container.
- `vercel.json` - Configuration for deploying the API to Vercel, allowing Cross-Origin Resource Sharing (CORS).

---

## ⚙️ Setup and Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed, or [Docker](https://www.docker.com/) if you prefer to use containers.

### Local Development (Node.js)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Extract New Data:**
   Run the extractor to fetch the latest APOD entry and append it to your JSON database.
   ```bash
   npm run start
   ```

3. **Start the API Server:**
   This spins up the `json-server` via the custom `src/server.js` implementation.
   ```bash
   npm run start_db
   ```

4. **Watch Mode:**
   To run `json-server` directly in read-only and watch mode on `consolidated.json`:
   ```bash
   npm run watch
   ```

### Python Extractor
If you prefer to extract data using Python instead of Node.js:
1. Ensure you have the `requests` library installed (`pip install requests`).
2. Run the basic script:
   ```bash
   python src/basic.py
   ```

---

## 🐳 Docker Deployment

The project can be effortlessly run via Docker. It will serve the `consolidated.json` file on port `8888`.

**1. Build the Docker Image:**
```bash
docker build -t json-server .
```

**2. Run the Container:**
```bash
docker run -d -p 8888:8888 --name json-server json-server:latest
```

The API will now be accessible at `http://localhost:8888`.

---

## ☁️ Vercel Deployment

The repository includes a `vercel.json` file which sets up `access-control-allow-origin: *` to prevent CORS issues. This means you can hook this repository up to Vercel and instantly get a live, public API of your APOD data.

---

## 📝 License
This project is licensed under the ISC License.
