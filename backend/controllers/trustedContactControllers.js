const TrustedContact = require('../models/TrustedContact');

// Create a new trusted contact
exports.createTrustedContact = async (req, res) => {
  const {
    contactUpiId,
    contactName,
    nickname,
    relationship,
    notes,
    verificationMethod
  } = req.body;

  try {
    const newContact = new TrustedContact({
      user: req.user.id,
      contactUpiId,
      contactName,
      nickname,
      relationship,
      notes,
      verificationMethod
    });

    await newContact.save();
    res.status(201).json(newContact);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Contact already exists for this user.' });
    }
    res.status(400).json({ message: err.message });
  }
};

// Get all trusted contacts for logged-in user
exports.getTrustedContacts = async (req, res) => {
  try {
    const contacts = await TrustedContact.find({ user: req.user.id }).sort({ addedAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a trusted contact
exports.updateTrustedContact = async (req, res) => {
  try {
    const contact = await TrustedContact.findOne({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    Object.assign(contact, req.body); // Update fields dynamically
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a trusted contact
exports.deleteTrustedContact = async (req, res) => {
  try {
    const contact = await TrustedContact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
