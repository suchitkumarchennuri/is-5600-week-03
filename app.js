const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Serves up the chat.html file
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

/**
 * This endpoint will receive chat messages and emit them to all listeners
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
app.get('/chat', (req, res) => {
  const { message } = req.query;
  if (message) {
    chatEmitter.emit('message', message);
  }
  res.end();
});

/**
 * This endpoint will respond to the client with a stream of server-sent events
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = (message) => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
