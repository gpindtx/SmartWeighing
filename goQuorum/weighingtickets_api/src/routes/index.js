const express = require('express');
const router = express.Router();
const IndexController = require('../controllers/index');

router.get('/', IndexController.indexPage);

module.exports = router;
