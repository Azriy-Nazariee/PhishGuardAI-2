import bcrypt from 'bcrypt';

const signUpHandler = async (req, res, db) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists in MongoDB
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user to MongoDB
    await db.collection('users').insertOne({ email, password: hashedPassword });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default signUpHandler;

