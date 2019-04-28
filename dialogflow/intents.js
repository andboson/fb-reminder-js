var config = require('./../config.json');
const dialogflow = require('dialogflow');


let Intents = {
  list: function () {
    getIntents();
  },
  create: function () {
    //show menu
    tf = ['get started', 'show_menu', 'menu', 'get_started', 'help'];
    createIntent('menu', tf);
    
    //delete all
    tf = ['remove all', 'clear all', 'prune', 'delete_all'];
    createIntent('delete_all', tf);

    //show for today
    tf = ['today', 'show for today', 'agenda', 'show_today'];
    createIntent('show_today', tf);

    //create
    tf = ['create', 'create reminder', 'set', 'new', 'remind', 'reminder_create'];
    createIntent('reminder_create', tf, false);

    //reminder actions
    tf = ['alert', 'snooze', 'confirm', 'save','save!', 'type', 'text', 'done'];
    createIntent('reminder_action', tf);
    
  }
}

const WEBHOOK_STATE_UNSPECIFIED = 0;
const WEBHOOK_STATE_ENABLED = 1;
const WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING = 2;

const createIntent = async function (displayName, trainingPhrasesParts, whEnabled = true, params = []) {
  let messageTexts = '';
  let webhookState = WEBHOOK_STATE_ENABLED;

  if (!whEnabled) {
    webhookState = WEBHOOK_STATE_UNSPECIFIED;
  }

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient({
    projectId: config.projectId,
    credentials: {
      private_key: config.private_key,
      client_email: config.client_email
    }
  });

  const projectAgentPath = intentsClient.projectAgentPath(config.project_id);

  const trainingPhrases = [];

  trainingPhrasesParts.forEach(trainingPhrasesPart => {
    const part = {
      text: trainingPhrasesPart,
    };

    // Here we create a new training phrase for each provided part.
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: [part],
    };

    trainingPhrases.push(trainingPhrase);
  });

  const messageText = {
    text: messageTexts,
  };

  const message = {
    text: messageText,
  };

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
    webhookState: webhookState,
    parameters: params
  };

  const createIntentRequest = {
    parent: projectAgentPath,
    intent: intent,
  };

  // Create the intent
  const responses = await intentsClient.createIntent(createIntentRequest);
  console.log(`Intent ${responses[0].name} created`);
}

const getIntents = async function () {
  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient({
    projectId: config.projectId,
    credentials: {
      private_key: config.private_key,
      client_email: config.client_email
    }
  });

  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.projectAgentPath(config.project_id);

  const request = {
    parent: projectAgentPath,
  };

  // Send the request for listing intents.
  const [response] = await intentsClient.listIntents(request);
  response.forEach(intent => {
    console.log('====================');
    console.log(`Intent name: ${intent.name}`);
    console.log(`Intent display name: ${intent.displayName}`);
    console.log(`Action: ${intent.action}`);
    console.log(`Root folowup intent: ${intent.rootFollowupIntentName}`);
    console.log(`Parent followup intent: ${intent.parentFollowupIntentName}`);

    console.log(`\n jsons: ${JSON.stringify(intent)}`);
  });

  return response;
}


// const intentsClient = new dialogflow.IntentsClient();
// const intentPath = intentsClient.intentPath(projectId, intentId);
// const request = {name: intentPath};

// // Send the request for deleting the intent.
// const result = await intentsClient.deleteIntent(request);
// console.log(`Intent ${intentPath} deleted`);
// return result;

exports.Intents = exports.default = Intents;