# 🎯 Zero Points Quiz Event Management Application

[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20|%20CSS3%20|%20JavaScript%20(ES6%2B)-blue.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)
[![Deployment](https://img.shields.io/badge/Deployment-Localhost%20|%20GitHub%20Pages-orange.svg)](#)

A modern, responsive, and fully client-side web application developed for managing the **Zero Points Quiz**, a tournament-style quiz competition where the objective is to achieve the **lowest score**. The application provides an intuitive interface for quiz coordinators to manage teams, control gameplay, update scores in real time, and present the quiz seamlessly during live events.

Built entirely with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**, the application requires no backend, database, or additional frameworks. All game data is stored locally in the browser using **Local Storage**, allowing the quiz to continue even after a page refresh.

---

## ✨ Features

- **Interactive Quiz Board**
  - 4×4 question grid with four categories and four point values.
  - Optimized for projector and large-screen presentations.

- **Real-Time Leaderboard**
  - Automatically updates team rankings after every question.
  - Teams are ranked in ascending order since the objective is to reach **0 points**.

- **Question Pass Management**
  - Supports sequential passing of unanswered questions.
  - Prevents duplicate attempts using an internal pass tracking system.
  - Handles score updates accurately after each pass.

- **Admin Control Panel**
  - Add or remove teams during the event.
  - Modify team scores manually.
  - Change the active team's turn.
  - Reset the entire game when required.

- **Persistent Game State**
  - Automatically saves game progress using browser Local Storage.
  - Restores teams, scores, and game state after refreshing the page.

- **Serverless Deployment**
  - No installation or backend configuration required.
  - Can be executed directly from the browser or hosted using any static web server.

---

## 🎮 Game Rules

- Every team begins with **1000 points**.
- A **correct answer** deducts the question's point value from the team's score.
- An **incorrect answer** adds the question's point value to the team's score.
- Questions may be passed to the next team if unanswered.
- The team with the **lowest score** at the end of the quiz is declared the winner.

---

## 📂 Quiz Categories

The application currently supports four quiz categories:

- 💻 Technology
- ⚽ Sports
- 🎓 Rajagiri
- 🎬 Entertainment

Additional categories and questions can be added easily by modifying the JavaScript data files.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic page structure |
| CSS3 | Responsive layouts, animations, glassmorphism UI |
| JavaScript (ES6+) | Game logic, state management, rendering |
| Local Storage API | Persistent browser-based data storage |
| Google Fonts (Outfit) | Typography |
| Font Awesome | Icons |

---

## 📁 Project Structure

```
Zero_Points_Quiz/
│
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── icons/
│   ├── fonts/
│   └── images/
└── README.md
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/Zero_Points_Quiz.git
cd Zero_Points_Quiz
```

### Run the Application

Simply open the `index.html` file in any modern web browser.

Alternatively, start a local development server:

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

---

## 🎯 Highlights

- Pure Vanilla JavaScript implementation
- Responsive user interface
- Fully offline capable
- No external backend or database
- Persistent game state using Local Storage
- Easy to customize with new teams, categories, and questions

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Alvin Viju Varkey**

If you found this project useful, consider giving it a ⭐ on GitHub.
