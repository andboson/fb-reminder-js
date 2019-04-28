const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment');
var config = require('./../config.json');

let Client = {
  New: function (options) {
    let agent = new WebhookClient(options);
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('reminder_create', remind);
    intentMap.set('reminder_create - set time - set text', remindCreate);
    // intentMap.set('reminder_saved', remindCreateComplete);
    intentMap.set('reminder_action', remindActions);
    intentMap.set('show_today', showToday);
    intentMap.set('delete_all', deleteAll);

    intentMap.set('menu', this.showMenu);

    try {
      agent.fb = options.request.fb;
      agent.db = options.request.db;

      agent.handleRequest(intentMap);
    } catch (e) {
      //console.log('\n Req:', JSON.stringify(options.request));
      console.log('\n Error:', e);

    }

    return agent;
  },
  showMenu: function (agent) {
    console.log('===', agent.originalRequest.payload.data.sender.id);
    agent.fb.ShowMenu(agent.originalRequest.payload.data.sender.id);
  }
}

exports.Client = exports.default = Client

function welcome(agent) {
  agent.add(`Welcome to Express.JS reminder!`);

  console.log(agent.originalRequest.payload.data.sender);
}


function fallback(agent) {
  console.log('--0', agent.query);
  console.log('--2', agent.originalRequest);
  console.log('--3', JSON.stringify(agent.context));

  if (agent.query == 'cancel') {
    agent.add(`ok`);
    return;
  }

  if (agent.query == 'This is a test page?') {
    agent.add(`Yep!`);
    return;
  }

  // catch enter time error
  let ctx = agent.context.get('reminder_create-followup');
  if (ctx !== undefined) {
    agent.setFollowupEvent('reminder_create - set time');
    agent.context.set({ 'name': 'reminder_create-followup', 'lifespan': 1 })
    agent.add('');
    return;
  }

  agent.add(`I'm sorry, can you try again?`);
}

function remind(agent) {
  agent.add('Enter in what time (5m, tomorrow 10am,5 days 14pm)');
  agent.setFollowupEvent('reminder_setup_time');
  agent.context.set({ 'name': 'reminder-followup', 'lifespan': 3, 'parameters': { 'suggested_time': 'dateTimeStart' } });
}

function remindCreate(agent) {
  let text = agent.query;
  let paramTime = '';

  let ctx = agent.context.get('reminder_create-settime-followup');
  try {
    paramTime = ctx.parameters.time;
  } catch (e) {
    console.log('\n incorrect time', e, ctx.parameters);
    agent.add('Cannot get time');
    agent.setFollowupEvent('reminder_create - set time - set text');
    agent.context.set({ 'name': 'reminder_create-settime-followup', 'lifespan': 1 })

    return;
  }

  let fbId = agent.originalRequest.payload.data.sender.id;

  // send confirm dialog
  agent.context.set({ 'name': 'done', 'lifespan': 1, 'parameters': { 'text': text, 'time': paramTime, 'facebook_sender_id': fbId } })
  agent.fb.ReminderCreateConfirm(fbId, { text: text, time: paramTime });
  agent.add('choose');
}

function remindActions(agent) {
  let query = JSON.parse(agent.query);

  // save reminder to db
  if (query.type == 'save') {
    let params = agent.context.get('done').parameters;
    let reminder = {
      text: params.text,
      time: params.time,
      user_id: params.facebook_sender_id
    }

    agent.db.Create(reminder);
  }

  // delete reminder
  if (query.type == 'delete' || query.type == 'confirm') {
    agent.db.DeleteByID(query.alert.id);
  }

  // snooze reminder
  if (query.type == 'snooze') {
    agent.db.SnoozeByID(query.alert.id);
    agent.add('ok, I will remind you in ' + config.snooze_period);
    return;
  }


  agent.add('done!');
}

function showToday(agent) {
  let uid = agent.originalRequest.payload.data.sender.id;
  agent.db.GetByUser(uid).then(data => {
    if (data.length === 0) {
      agent.add('empty');
    } else {
      agent.fb.ShowReminders(uid, data);
    }
  }).
    catch(error => {
      console.log('\n db error:', error);
    });

  agent.add('');
}

function deleteAll(agent) {
  let uid = agent.originalRequest.payload.data.sender.id;
  agent.db.DeleteAllByUser(uid).
    catch(error => {
      console.log('\n db error:', error);
    });

  agent.add('all clear');
}

