const admin = require("firebase-admin");

const base64String = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
if (!base64String) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required');
}

const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
const credentials = JSON.parse(decodedString);

// Ensure we only initialize the app once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials)
  });
}

/**
 * Firebase Auth middleware.
 * Verifies the Firebase ID token, checks if the user is disabled,
 * and attaches user info (including role from Custom Claims) to req.user.
 */
module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user account is disabled in Firebase Auth
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    if (userRecord.disabled) {
      return res.status(403).json({ error: 'User account has been disabled' });
    }

    // Role source of truth is Firestore (users/{uid}.role), same as the client's AuthContext.
    // Custom claims are only a fallback because they are not set for existing accounts.
    let role = decodedToken.role || 'user';
    try {
      const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        role = userDoc.data().role || role;
      }
    } catch (roleError) {
      console.error('Failed to resolve user role from Firestore:', roleError);
    }

    // Attach user info to request
    req.user = {
      _id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name || null,
      role,
      phoneNumber: decodedToken.phone_number || null,
    };

    next();
  } catch (err) {
    // Avoid leaking token or internal error details to client
    return res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
};
