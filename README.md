# Assignment 8 - Student Records REST API

Node.js, Express, and MongoDB API for student CRUD. Includes a Postman collection, an automated in-memory MongoDB test suite, Render Blueprint, and GitHub Pages API reference.

## API routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | API and MongoDB connection status |
| `POST` | `/api/students` | Create a student |
| `GET` | `/api/students` | List students; optionally filter using `?department=Computer%20Science` |
| `GET` | `/api/students/:id` | Get one student |
| `PUT` | `/api/students/:id` | Update one or more student fields |
| `DELETE` | `/api/students/:id` | Delete a student |

Student fields: `name` (2–80 characters), `rollNumber` (unique, stored uppercase), `department` (2–80 characters), and `marks` (0–100). Responses are JSON. Invalid input returns `400`, missing students `404`, and duplicate roll numbers `409`.

## Run locally

1. Install Node.js 20 or newer and MongoDB, or create a free MongoDB Atlas cluster.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to the database connection string. Never commit `.env` or publish its URI.
3. Install and start the API:

   ```bash
   npm ci
   npm run dev
   ```

4. Check `http://localhost:3000/api/health`.

## Test the API and Postman collection

Run the automated CRUD suite, including the actual Postman collection through Newman against a temporary in-memory MongoDB:

```bash
npm test
```

To use the collection in Postman, import `postman/Assignment-8-Student-API.postman_collection.json`, set its `baseUrl` collection variable to `http://localhost:3000`, start the local API, and run the collection. The Create request saves its ID for the following Read, Update, and Delete requests. Newman, the Postman CLI runner, is also included in the automated test suite.

## Deploy the API on Render

1. Create a MongoDB Atlas cluster. In **Network Access**, allow connections from Render (for a demo, Atlas allows `0.0.0.0/0`; use stronger network restrictions for a production project). Create a database user and copy its connection URI.
2. In Render, create a new **Blueprint** from this repository and select `render.yaml`.
3. When Render asks for `MONGODB_URI`, add the Atlas URI as a secret environment value in Render. Do not paste it into source code, GitHub, Postman examples, or chat.
4. Wait for the service to deploy. Visit `/api/health`; it should return `{"status":"ok","database":"connected"}`.
5. Set the Postman `baseUrl` to the Render service URL and run the collection.

The free Render service can sleep while idle and may take a little while to respond on its first request. MongoDB Atlas and Render accounts are managed by the project owner; this repository cannot create or access your database credentials.

## GitHub Pages

The Pages site hosts static API documentation under `docs/`. It cannot run the Node/Express server or connect directly to MongoDB. Configure the repository's **Settings → Pages → Source → GitHub Actions**. The Actions workflow runs `npm test` and publishes the API documentation on every push to `main`.
