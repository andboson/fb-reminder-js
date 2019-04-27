var express = require('express');
var router = express.Router();
var config = require('./../config.json');
//const dialogflow = require('dialogflow');
const {WebhookClient} = require('dialogflow-fulfillment');


const {
  dialogflow,
  BasicCard,
  Button,
  RegisterUpdate,
  Suggestions,
  UpdatePermission,
} = require('actions-on-google');



const app = dialogflow({debug: true});


function welcome (agent) {
  agent.add(`Welcome to Express.JS webhook!`);
  agent.ask(new Suggestions('Alert me of new tips'));
}

function fallback (agent) {
  agent.add(`I didn't understand`);
  agent.add(`I'm sorry, can you try again?`);
}


router.post('/', function (req, res, next) {

  const agent = new WebhookClient({request: req, response: res});
  console.info(`agent set`);

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
// intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
  agent.handleRequest(intentMap);

});


module.exports = router;
