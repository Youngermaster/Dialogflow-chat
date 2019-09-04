const dialogflow = require('dialogflow');
const uuid = require('uuid');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// A unique identifier for the given session
const sessionId = uuid.v4();


// Settings
app.set('port', process.env.PORT || 5500);
app.use(bodyParser.urlencoded(
  {
    extended:false
  }
));

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// Routes
app.get('/', function (req, res) {
  res.sendFile("index.html");
})

app.post('/send-msg', (req, res) => {

  runSample(req.body.MSG)
  .then( data => {
    res.send({Reply:data})
  });
});

// starting the server
app.listen(app.get('port'), (req, res) => {
  console.log(`server on port ${app.get('port')}`);
});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(userMessage, projectId = 'metis-es-lfflxf') {
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
      keyFilename: "/home/youngermaster/GitHub/dialogflow-chat/METIS-ES-a64062639f09.json"
    });
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: userMessage,
        // The language used by the client (en-US)
        languageCode: 'es',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  return result.fulfillmentText;
}