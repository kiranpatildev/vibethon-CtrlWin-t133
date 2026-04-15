# 🧠 NeuralPath — Master AI & Machine Learning

**NeuralPath** is a full-stack, highly interactive learning platform designed to take students from absolute beginners to AI practitioners. Instead of passive video lectures, NeuralPath uses gamification, in-browser Python execution, interactive visualizations, and an embedded AI tutor powered by Google Gemini to create an engaging learning experience.

![NeuralPath Mockup Placeholder](./neuralpath_frontend/public/icons.svg) *(Replace with actual screenshot)*

## ✨ Key Features

- 📚 **Structured Curriculum**: Three comprehensive tracks (Beginner, Practitioner, Advanced) covering everything from "What is ML?" to Neural Networks and Transformers.
- 💻 **In-Browser Code Lab**: Write and execute Python/NumPy code directly within the browser using WebAssembly (`Pyodide`) and Monaco Editor—no local backend containers required!
- 🎮 **Game Zone (Visual Learning)**:
  - *Train the Neuron*: Adjust weights and biases in real-time to understand activation functions and decision boundaries.
  - *Sort the Data*: A fast-paced gamified classification task (Spam vs. Ham).
  - *Gradient Descent Surfer*: Interactively tune the learning rate and watch a ball roll down a loss curve to grasp optimization.
- 🧪 **Sim World**: Train machine learning models on classic datasets (Iris, MNIST, Titanic) directly in the app.
- 🏆 **Gamification**: Earn XP, build daily streaks, unlock badges, and compete globally on the Leaderboard.
- ⚡ **Quiz Arena**: Test your knowledge and earn XP to advance through modules.
- 🤖 **Powered by Google Gemini (gemini-2.5-flash)**:
  - **AI Tutor Chat**: A floating assistant that understands what module you're on and answers complex ML questions simply.
  - **Dynamic Quiz Generator**: Automatically generates JSON-formatted quizzes based on topic and difficulty.
  - **Code Hints**: Stuck in Code Lab? Gemini reads your code and provides gentle nudges without giving away the answer.
  - **Explainable AI**: The AI breaks down why the models in Sim World made specific predictions in plain English.

## 🛠️ Technology Stack

**Frontend:**
* React 18 (Vite)
* Tailwind CSS (Custom "Vibrant Dark Neural Aesthetic")
* Framer Motion (Micro-interactions & Animations)
* Pyodide (In-browser Python runtime)
* Monaco Editor (VS Code in browser)
* Recharts (Data visualization)

**Backend:**
* Django 4.2 & Django REST Framework
* PostgreSQL
* Google GenAI SDK (`google-genai` 1.73+)
* Django Token Authentication (Local-first Auth)

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL server (running locally)
- Google Gemini API Key (get one at [aistudio.google.com](https://aistudio.google.com))

### 1. Database Setup
Ensure you have PostgreSQL running locally. Create a database named `NeuralPath` and ensure the user/password matches your `.env` settings (default user: `postgres`, password: `KIRAN`).

### 2. Backend Setup
Navigate to the root project directory and set up the Python backend:

```bash
# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows

# 2. Configure environment variables
# Ensure your neuralpath_backend/.env file has:
# DATABASE_URL=postgresql://postgres:KIRAN@localhost:5432/NeuralPath
# DJANGO_SECRET_KEY=your_secret_key
# DEBUG=True
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_MODEL=gemini-2.5-flash

# 3. Navigate to backend
cd neuralpath_backend

# 4. Install dependencies (make sure google-genai, django, djangorestframework, psycopg2-binary, etc. are listed in requirements)
pip install -r requirements.txt 

# 5. Run migrations
python manage.py migrate

# 6. Seed the database with the curriculum and starter datasets
python manage.py seed_curriculum
python manage.py seed_datasets

# 7. Start the server 
# Note: Always use the venv python explicitly if you previously had global namespace conflicts with google SDKs.
..\venv\Scripts\python.exe manage.py runserver
```

### 3. Frontend Setup
Open a new terminal window:

```bash
cd neuralpath_frontend

# 1. Install dependencies
npm install

# 2. Configure environment variables
# Ensure neuralpath_frontend/.env has:
# VITE_API_BASE_URL=http://localhost:8000

# 3. Start the Vite dev server
npm run dev
```

The app will be running at `http://localhost:5173` (or `5174/5175`). Open your browser, create an account, and start learning!

## 📂 Project Architecture

```
NeuralPath/
├── neuralpath_backend/          # Django REST API
│   ├── apps/
│   │   ├── core/                # custom Auth, XP tracking, Streaks, UserProfiles
│   │   ├── curriculum/          # Tracks, Modules, Lessons, UserProgress
│   │   ├── datasets/            # SQLite/Postgres wrappers for ML datasets
│   │   ├── gemini/              # AI integrations (Google GenAI SDK wrappers)
│   │   ├── leaderboard/         # Real-time ranking logic for XP scores
│   │   └── quiz/                # Static & Dynamic Quiz engines
│   └── neuralpath/              # Core Django Settings & URL Routing
│
└── neuralpath_frontend/         # React Application
    ├── src/
    │   ├── components/
    │   │   ├── games/           # Interactive Logic (TrainTheNeuron, SortTheData, GradientSurfer)
    │   │   ├── layout/          # Theme, Navbar, Nav Links
    │   │   └── AITutorChat.jsx  # Floating global AI tutor interface
    │   ├── context/             # AuthContext (Token Authentication Mgmt)
    │   ├── lib/                 # pyodide singleton, API wrapper
    │   └── pages/               # Main routes (Dashboard, CodeLab, SimWorld, Learn, etc.)
```

## 🤝 Built For Hackathons & Learning
This project was conceptualized to merge top-tier modern web design with hardcore algorithmic visualization and LLM assistance, acting as the ultimate automated machine learning tutor.
