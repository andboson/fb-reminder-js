const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment');
const { App } = require('actions-on-google');
const {
  dialogflow,
  BasicCard,
  Button,
  RegisterUpdate,
  Suggestions,
  PermissionRequest,
  Image
} = require('actions-on-google');

let Client = {
  New: function (options) {
    let agent = new WebhookClient(options);
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('remind', remind);
    intentMap.set('menu', this.showMenu);

    agent.fb = options.request.fb;
    agent.handleRequest(intentMap);

    return agent;
  },
  showMenu: function (agent) {
    console.log('===', agent.originalRequest.payload.data.sender.id);
    agent.fb.ShowMenu(agent.originalRequest.payload.data.sender);
  }
}

exports.Client = exports.default = Client

const { FBClient } = require('./../facebook/fb_client');

function welcome(agent) {
  agent.add(`Welcome to Express.JS webhook!`);
  agent.add(new Suggestion('Alert me of new tips'));

  console.log(agent.originalRequest.payload.data.sender);

  FBClient.ReminderAlert('2090530197712405', { title: 'some reminder!' })
}


function fallback(agent) {
  agent.add(`I'm sorry, can you try again?`);

  agent.setFollowupEvent('remeeeeind2');
  agent.context.set({ 'name': 'makeappointment-followup', 'lifespan': 3, 'parameters': { 'suggested_time': 'dateTimeStart' } });
  // Delete the context 'MakeAppointment-suggestion'.
  agent.context.delete('makeappointment-generic');
}

function remind(agent) {
  // agent.add(new Card({
  //   title: 'Title: this is a card title',
  //   imageUrl: 'https://developers.google.com/actions/assistant.png',
  //   text: 'This is the body text of a card.  You can even use line\n  breaks and emoji! 💁',
  //   buttonText: 'This is a button',
  //   buttonUrl: 'https://assistant.google.com/'
  // })
  // );

  //agent.add(new Suggestion('Quick Reply'));
  // agent.add(new Suggestion('Suggestion!'));

  const anotherSuggestion = new Suggestion({
    title: 'Set reminder?',
    reply: 'yes',
    platform: 'FACEBOOK'
  });
  anotherSuggestion.addReply_('no');
  agent.add(anotherSuggestion)
}