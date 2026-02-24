# Law Guidance App

A full-stack web application that provides legal guidance and contract analysis using AI-powered technology. This application helps users understand legal concepts, analyze contracts, and get guidance on legal matters.

## 🌟 Features

- **AI-Powered Legal Assistance**: Leverages Google's Generative AI to provide intelligent legal guidance
- **Contract Analysis**: Analyze and review legal contracts with AI assistance
- **Interactive UI**: Modern, responsive interface built with React
- **Secure API**: Rate-limited, helmet-protected backend with comprehensive logging
- **Real-time Responses**: Fast and efficient legal query processing
- **Error Handling**: Robust error handling and validation using Joi
- **Logging System**: Comprehensive logging with Winston for monitoring and debugging

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** with **Express** - Web server framework
- **Google Generative AI** (@google/generative-ai v0.24.1) - AI integration
- **Winston** (v3.17.0) - Logging library
- **Joi** (v18.0.1) - Schema validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Google Generative AI API key

## 🚀 Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Yashwatts/law-guidance-app.git
cd law-guidance-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
GOOGLE_API_KEY=your_google_generative_ai_api_key_here
```

Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🏗️ Project Structure

```
law-guidance-app/
├── backend/
│   ├── routes/
│   │   └── legal.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🔒 Security Features

- **Helmet**: Secures Express apps by setting various HTTP headers
- **Rate Limiting**: Prevents abuse with 100 requests per 15-minute window per IP
- **CORS Protection**: Configured for specific frontend origins
- **Input Validation**: Joi schema validation for API requests
- **Error Logging**: Comprehensive error tracking with Winston

## 📝 API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/*` - Legal guidance endpoints (see routes/legal.js for details)

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Frontend
The frontend is configured for deployment on Vercel (as indicated by the CORS configuration).

### Backend
The backend includes:
- Graceful shutdown handling
- Production-ready logging
- Environment-based configuration

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This application provides general legal information and guidance. It is not a substitute for professional legal advice. Always consult with a qualified attorney for specific legal matters.
