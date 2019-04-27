var express = require('express');
var router = express.Router();
var config = require('./../config.json');
const dialogflow = require('dialogflow');
const {
  dialogflow,
  BasicCard,
  Button,
  RegisterUpdate,
  Suggestions,
  UpdatePermission,
} = require('actions-on-google');



const app = dialogflow({debug: true});

router.post('/', function (req, res, next) {

  app.intent('Default Welcome Intent', (conv) => {
    const welcomeMessage = `Hi! Welcome to Actions on Google Tips! ` +
        `I can offer you tips for Actions on Google. You can choose to ` +
        `hear the most recently added tip, or you can pick a category ` +
        `from ${uniqueCategories.join(', ')}, or I can tell you a tip ` +
        `from a randomly selected category.`;

    conv.ask(welcomeMessage);
    conv.ask(new Suggestions('Alert me of new tips'));
  });

});


module.exports = router;
