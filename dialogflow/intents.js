var express = require('express');
var router = express.Router();
var config = require('./../config.json');

/* GET home page. */
router.get('/', function (req, res, next) {

  const resp = start();

  res.json({ title: 'Express', response: resp });
});


const start = async function () {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient({
    projectId: config.projectId,
    credentials: {
      private_key: config.private_key,
      client_email: config.client_email
    }
  });

  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.projectAgentPath('reminder-2dcf5');

  const request = {
    parent: projectAgentPath,
  };

  console.log(projectAgentPath);

  // Send the request for listing intents.
  const [response] = await intentsClient.listIntents(request);
  response.forEach(intent => {
    console.log('====================');
    console.log(`Intent name: ${intent.name}`);
    console.log(`Intent display name: ${intent.displayName}`);
    console.log(`Action: ${intent.action}`);
    console.log(`Root folowup intent: ${intent.rootFollowupIntentName}`);
    console.log(`Parent followup intent: ${intent.parentFollowupIntentName}`);

    console.log('Input contexts:');
    intent.inputContextNames.forEach(inputContextName => {
      console.log(`\tName: ${inputContextName}`);
    });

    console.log('Output contexts:');
    intent.outputContexts.forEach(outputContext => {
      console.log(`\tName: ${outputContext.name}`);
    });
  });

  return response;
}

module.exports = router;
