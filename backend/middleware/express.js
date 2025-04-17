const express = require('express');
const app = express();

// Configure body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

module.exports = app;