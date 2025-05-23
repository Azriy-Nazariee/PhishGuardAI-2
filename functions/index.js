// ... your imports remain the same
import express from 'express';
import cors from 'cors';
import { connect, getDB } from './db.js';
import { authenticateUser } from "./middleware/auth.js";

// Import route handlers
import signUpHandler from './registration/signUp.js';
import loginHandler from './registration/login.js';
import submitFeedbackHandler from './feedback/submitFeedback.js';
import analyseFileHandler from './analysis/analyseFile.js';
import getHistoryHandler from './analysis/getHistory.js';
import getReportHandler from './report/getReport.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to wrap route handlers and inject db
function withDB(handler) {
  return async (req, res) => {
    const db = getDB();
    return handler(req, res, db);
  };
}

// Connect to DB first, then start server
connect()
  .then(() => {
    // Public routes
    app.post('/api/signup', withDB(signUpHandler));
    app.post('/api/login', withDB(loginHandler));

    // Feedback route (public or protected — up to you)
    app.post('/api/feedback', submitFeedbackHandler);

    // Protected routes
    app.post('/api/analyse-file', authenticateUser, ...analyseFileHandler);  // ← Protected!
    app.get('/api/analysis-history', authenticateUser, withDB(getHistoryHandler));  // ← Protected!

    // Report route (you might want to protect this too)
    app.get("/api/report/:id", authenticateUser, getReportHandler);  // Optional protection

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
