var admin = require("firebase-admin");

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Ensure we only initialize the app once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials)
  });
}

module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Authorization header:', authHeader); // For debugging
  console.log('Token:', token); // For debugging
  if (!token) {
    console.error('No token provided'); // For debugging
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded token:', decodedToken); // For debugging
    // Add user information to request
    req.user = {
      _id: decodedToken.uid, // Ensure we have _id for MongoDB compatibility
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name,
      // Add any other needed fields from decodedToken
    };

    console.log('Authenticated user:', req.user); // For debugging
    next();
  } catch (err) {
    console.error('Auth error:', err); // For debugging
    return res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
};
