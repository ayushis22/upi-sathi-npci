const express = require('express');
const router = express.Router();
const { createTrustedContact, getTrustedContacts, updateTrustedContact, deleteTrustedContact } = require('../controllers/trustedContactControllers');
const { protect } = require('../middleware/auth'); // your auth middleware
console.log('Controller:', createTrustedContact);

router.post('/', protect, createTrustedContact);
router.get('/', protect, getTrustedContacts);
router.put('/:id', protect, updateTrustedContact);
router.delete('/:id', protect, deleteTrustedContact);

module.exports = router;
