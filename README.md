# 🎯 '0' Points Quiz Event Management Application

Welcome to the **'0' Points Quiz System** — a premium, interactive, single-page web application designed for presenters and event coordinators to digitally manage the unique '0' Points Quiz. 

Unlike traditional quizzes, teams start with a high score (1000 points) and compete to **lower** their score down to exactly 0 (or the lowest possible) by answering questions correctly.

---

## ✨ Features

- **🎮 Seamless Presenter View**: A gorgeous, interactive 4x4 quiz board grid containing 4 categories (**Tech, Sports, Rajagiri, Entertainment**) and 4 difficulty tiers (**20, 40, 60, and 80 points**).
- **📋 Team Registration & Setup**: Quickly register teams (3-4 members per team) or auto-generate demo teams for instant testing.
- **🏆 Live Leaderboard**: A dynamic, real-time leaderboard sidebar that automatically ranks teams from lowest score (1st place) to highest score. The active team currently in rotation is highlighted with a pulse-glow indicator.
- **🔄 Smart Pass & Turn Logic**: 
  - Standard rotation automatically advances to the next team after a cell is resolved.
  - Interactive passing allows questions to be passed sequentially to other teams.
  - Pass history/chains are visually displayed in the question overlay.
- **⚙️ Admin Dashboard Drawer**: Floating drawer for controllers to:
  - Add/remove teams mid-game.
  - Manually override active turns.
  - Manually adjust (add or subtract) scores for any team to handle special rules, penalties, or custom bonuses.
  - Reset the entire game state.
- **💾 Local Persistence**: Game state is automatically synchronized with the browser's `localStorage` so that refreshing the page or closing the window never loses game progress.

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5.
- **Styling**: Vanilla CSS3 utilizing CSS custom variables (HSL palette), glassmorphism, responsive grid layout, and keyframe glows.
- **Fonts & Icons**: Google Fonts (*Outfit*), FontAwesome Icons (CDN).
- **Logic**: Clean, modern ES6+ JavaScript (no heavy frameworks or dependencies, allowing the project to run entirely client-side).

---

## 🚀 How to Run the App (Locally)

Since the application is serverless, you do not need to install complex dependencies.

### Option A: Double-Click (Offline)
1. Navigate to the project folder.
2. Double-click the `index.html` file to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Option B: Local Server (Recommended for local hosting)
If you have Python installed, you can serve the directory:
```bash
# In terminal, navigate to the folder:
cd zero-points-quiz
# Start local server:
python -m http.server 8000
```
Then open your browser and go to `http://localhost:8000`.

---

## 🎮 Game Rules & Scoring

1. **Initial Score**: Every registered team starts with **1000 points**.
2. **Correct Answer**: Subtracts the question's point value (e.g. 1000 - 80 = 920).
3. **Incorrect Answer**: Adds the question's point value (e.g. 1000 + 80 = 1080).
4. **Question Card Status**: Once a question is answered correctly (or locked manually without points), the card is marked with a checkmark and locked.
5. **Passing**: If a team passes, the coordinator clicks the "Pass" button, which shifts the attempt to the next team in line. Points are only awarded/deducted when someone answers or the question is closed.

---

## 🐙 How to Upload to GitHub

Follow these simple steps to upload this codebase to your own GitHub profile:

1. **Open your Git terminal** and initialize the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: '0' Points Quiz Board"
   ```
2. **Create a new repository** on [GitHub](https://github.com/new). Name it something like `zero-points-quiz`.
3. **Link your local repository and push**:
   *(Replace `<username>` with your GitHub username)*
   ```bash
   git branch -M main
   git remote add origin https://github.com/<username>/zero-points-quiz.git
   git push -u origin main
   ```
4. **Take screenshots** of your registration page, the main board during gameplay, and the admin panel, upload them to a folder (e.g., `screenshots/`), and embed them in this README!

---

*Designed & developed to provide a premium, modern, and exciting tournament quiz experience!*
