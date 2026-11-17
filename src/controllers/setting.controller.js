const Setting = require('../models/setting.model');

const KEY_PATTERN = /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/;
const MAX_KEYS = 200;
const MAX_VALUE_LENGTH = 20000;

const toMap = (docs) => {
  const settings = {};
  for (const doc of docs) {
    settings[doc.key] = doc.value;
  }
  return settings;
};

exports.getAllSettings = async (req, res) => {
  try {
    const docs = await Setting.find().lean();
    res.status(200).json(toMap(docs));
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

exports.upsertSettings = async (req, res) => {
  const input = req.body?.settings;

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return res.status(400).json({ message: 'settings must be an object of key/value pairs' });
  }

  const entries = Object.entries(input);

  if (entries.length === 0) {
    return res.status(400).json({ message: 'No settings provided' });
  }

  if (entries.length > MAX_KEYS) {
    return res.status(400).json({ message: `Too many settings (max ${MAX_KEYS})` });
  }

  for (const [key, value] of entries) {
    if (!KEY_PATTERN.test(key)) {
      return res.status(400).json({ message: `Invalid setting key: ${key}` });
    }
    if (typeof value !== 'string') {
      return res.status(400).json({ message: `Setting ${key} must be a string` });
    }
    if (value.length > MAX_VALUE_LENGTH) {
      return res.status(400).json({ message: `Setting ${key} exceeds ${MAX_VALUE_LENGTH} characters` });
    }
  }

  try {
    const now = new Date();
    await Setting.bulkWrite(
      entries.map(([key, value]) => ({
        updateOne: {
          filter: { key },
          update: { $set: { key, value, updatedAt: now } },
          upsert: true
        }
      }))
    );

    const docs = await Setting.find({ key: { $in: entries.map(([key]) => key) } }).lean();
    res.status(200).json(toMap(docs));
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ message: 'Error saving settings', error: error.message });
  }
};
