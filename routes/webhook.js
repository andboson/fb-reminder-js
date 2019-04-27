var express = require('express');
var router = express.Router();
const  { Client } = require('../dialogflow/client')

router.post('/', function (req, res, next) {
  const agent = Client.New({ request: req, response: res });
  
});

module.exports = router;



////////////////////////////

///----------------------------------------
////////////////////////////////



const {
  dialogflow,
  Image
} = require('actions-on-google');


const gapp = dialogflow({ debug: true })

// Register handlers for Dialogflow intents
gapp.intent('Default Welcome Intent', conv => {
  conv.ask('Hi, how is it going?')
  conv.ask(`Here's a picture of a cat`)
  conv.ask(new Image({
    url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
    alt: 'A cat',
  }))
})

// Intent in Dialogflow called `Goodbye`
gapp.intent('Goodbye', conv => {
  conv.close('See you later!')
})

gapp.intent('remind', conv => {
  conv.ask("HEY");
  conv.ask(new UpdatePermission({ intent: TELL_LATEST_TIP_INTENT }));
  conv.close('See you later!')
})

gapp.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you tell me something else?`)
})

router.post('/4', gapp)

