import { getDB } from '../db.js';  // Your MongoDB connection helper

export const getHistoryHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const userId = req.userId;  // Use userId from the auth middleware

  if (!userId) {
    return res.status(401).send('User ID is required');
  }

  try {
    const db = getDB();
    const collection = db.collection('Reports'); // Assuming 'Reports' stores analysis reports

    // If userId is a string but stored as ObjectId in DB, convert it
    // Otherwise, use it as is:
    const query = { userId };

    const cursor = collection.find(query).sort({ date: -1 });

    const history = await cursor.toArray();

    const formattedHistory = history.map((doc) => ({
      id: doc._id.toString(),
      date: doc.date,
      title: doc.title,
      sender: doc.sender,
      isPhishing: doc.isPhishing,
      riskScore: doc.riskScore,
      riskLevel: doc.riskLevel,
      suggestion: doc.suggestion,
      urls: doc.urls,
      flaggedKeywords: doc.flaggedKeywords,
      userId: doc.userId,
    }));

    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ error: error.message });
  }
};

export default getHistoryHandler;
