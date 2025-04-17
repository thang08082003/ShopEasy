const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create stream for writing to log file
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Create error log stream
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for logging request body
morgan.token('body', (req) => {
  // Don't log sensitive information like passwords
  const body = {...req.body};
  if (body.password) body.password = '[FILTERED]';
  if (body.confirmPassword) body.confirmPassword = '[FILTERED]';
  return JSON.stringify(body);
});

// Format for access logs
const accessLogFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

// Format for debug logs with request body
const debugLogFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body';

// Logger for regular requests
const accessLogger = morgan(accessLogFormat, {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400
});

// Logger for requests with errors
const errorLogger = morgan(debugLogFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

// Logger for development
const devLogger = morgan('dev');

module.exports = {
  accessLogger,
  errorLogger,
  devLogger
};
