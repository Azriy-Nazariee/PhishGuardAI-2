import { getDB } from '../db.js';  // your MongoDB connection helper

export const submitFeedbackHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { dashboardId, type, comments } = req.body;

  if (!dashboardId || !type) {
    return res.status(400).send('Dashboard ID and feedback type are required');
  }

  try {
    const db = getDB();
    const feedbackCollection = db.collection('feedback');

    await feedbackCollection.insertOne({
      dashboardId,
      type,
      comments: comments || '',
      submittedAt: new Date(),
    });

    return res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ error: error.message });
  }
};

export default submitFeedbackHandler;
