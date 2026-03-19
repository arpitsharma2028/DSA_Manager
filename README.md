# DSA Manager

A full-stack DSA problem management platform built to help users organize coding questions, track progress, maintain revisit schedules, and manage their problem-solving workflow in one place.

## Live Demo
🔗 https://dsamanagerr.vercel.app/

(Note: The backend may take a few seconds to respond initially as it is hosted on a free service.)
## GitHub Repository
`https://github.com/arpitsharma2028/DSA_Manager`

---

## Overview

Many students regularly practice DSA problems but do not have a proper system to manage solved questions, organize them topic-wise, or revisit weak areas.  
**DSA Manager** solves this problem by providing a structured platform where users can:

- Create and manage folders for different topics
- Add coding questions with links and notes
- Track problem difficulty across different platforms
- Store code solutions
- Schedule revisit questions
- View problem statistics
- Analyze time and space complexity details

---

## Features

- User authentication with JWT
- Folder-based organization of DSA questions
- Dedicated **REVISIT** system folder
- Add, edit, and delete coding questions
- Auto-fetch metadata from problem links
- Complexity analysis support
- Difficulty-wise tracking: Easy / Medium / Hard
- Dashboard statistics
- Protected routes with token-based authorization

---

## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- JWT authentication
- bcryptjs
- Axios
- Cheerio

### Database
- PostgreSQL

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Supabase PostgreSQL

---

## Project Structure

```bash
DSA_Manager/
│
├── frontend/
│   ├── src/
│   ├── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── sql/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── .gitignore
