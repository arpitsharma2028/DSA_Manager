# DSA Manager

A full-stack DSA problem management platform built to help users organize coding questions, track progress, maintain revisit schedules, and manage their problem-solving workflow in one place.

## Live Demo
🔗 https://dsamanagerr.vercel.app/

(Note: The backend may take a few seconds to respond initially as it is hosted on a free service.)
## GitHub Repository
`https://github.com/arpitsharma2028/DSA_Manager`

---

## 📖 The Story: Why I Built This (What I Noticed)

While practicing Data Structures and Algorithms, I noticed a major pattern among my friends and peers. Everyone was grinding hard on platforms like LeetCode, GeeksforGeeks, and CodeChef, but their management workflow was completely broken.

People were:
* **Losing track** of code snippets and unique problem approaches they had previously solved.
* **Forgetting to revise** tough questions, leading to a loop of solving the same problem months later completely from scratch.
* **Struggling to organize** problems topic-wise because practice was scattered across 3 or 4 different websites.
* **Losing motivation** because they couldn't visually see their overall progress metrics in one single hub.

I realized that keeping a messy Excel sheet or a random Notion page wasn't cutting it. It required too much manual typing, which honestly makes you lazy after solving a tough coding problem. I wanted to build a dedicated, smart tool that handles the organization for you, so you can focus entirely on problem-solving.

---

## 🎯 What I Tried to Solve

My main goal was to create a friction-free experience for software engineering students. I focused on solving three core problems:

* **Fragmentation:** Bringing LeetCode, GFG, and custom problems into a single, folder-segregated dashboard.
* **Manual Entry Fatigue:** Nobody wants to manually type out the problem title, its difficulty level, and optimal time complexities after a long coding session. I wanted the platform to fetch this data automatically just from a URL.
* **The Retention Problem:** Creating a smart tracking loop where you can flag a question for a "Revisit", assign a date, and get reminded when it goes overdue.

---

## 🛠️ How I Solved It

I built **DSA Manager** as a complete full-stack application. Here is how the key components work under the hood to solve the problems above:

### 1. Dynamic Dashboard & Folder Management
The main page acts as your central command center. You can dynamically create custom folders for different data structure topics (like Arrays, Trees, Dynamic Programming). The dashboard live-tracks your stats across the database, calculating your total solved questions, a visual Easy/Medium/Hard distribution count, and a dynamic count of your total pending revisits.

### 2. Automated Metadata Scraping (Cheerio Backend)
Instead of forcing the user to type out problem details, I implemented a scraper utility in the Node/Express backend using **Cheerio**. When you paste a problem link from LeetCode or GFG, the backend seamlessly parses the DOM structure of that URL to automatically extract the problem's title, difficulty level, and expected theoretical Time/Space complexity. Everything remains fully editable in case you want to customize it.

### 3. Complexity Comparison & Active Learning
Inside the "Add Question" modal, you can paste your exact code solution and log your own space/time complexity. This lets you directly compare your custom solution's performance against the optimal theoretical complexity of the problem. There is also a dedicated rich notes section where you can write down the core logic, edge cases, and key takeaways so you don't forget the intuition behind the solution.

### 4. Smart Revision Engine (The Revisit System)
When adding or editing a question, you can tick a "Mark for Revisit" checkbox and set a target date. The system automatically routes these flagged questions into a dedicated **REVISIT** system directory. Inside this folder, you can filter and sort your weak questions based on **Overdue**, **Newest First**, or **Oldest First**, making it incredibly efficient to review core algorithmic patterns right before a coding contest or technical interview.

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
