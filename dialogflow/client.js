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
    intentMap.set('reminder_create_set_text', remindCreate);
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

  let uid = agent.originalRequest.payload.data.sender.id;
  agent.fb.GetUserProfile(uid).
    then(user => {
      agent.db.CreateUser(uid, user);
    }).
    catch(error => {
      console.log('== user profile error', error);
    });

  console.log(agent.originalRequest.payload.data.sender);
}


function fallback(agent) {
  console.log('---fallback', agent.query);
  console.log('---ctx:', JSON.stringify(agent.context));

  let fbId = agent.originalRequest.payload.data.sender.id;

  // check actions
  if (agent.query.indexOf('alert') !== -1) {
    console.log('--alert exists--', agent.query);
    return remindActions(agent);
  }

  // cancel 
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
    console.log('--time err--', agent.query);
    agent.setFollowupEvent('reminder_create - set time');
    agent.context.set({ 'name': 'reminder_create-followup', 'lifespan': 1 })
    agent.add('');
    return;
  }

  // catch intent err
  ctx = agent.context.get('reminder_create-settime-followup');
  if (ctx != undefined) {
    console.log('--catch create--', agent.query);
    return remindCreate(agent);
  }

  agent.add(`I'm sorry, can you try again?`);
}

function remind(agent) {
  agent.add('Enter in what time (5m, tomorrow 10am,5 days 14pm)');
  agent.setFollowupEvent('reminder_setup_time');
  agent.context.set({ 'name': 'reminder-followup', 'lifespan': 3, 'parameters': { 'suggested_time': 'dateTimeStart' } });
}

function remindCreate(agent) {
  console.log('--cre--', agent.query);

  let text = agent.query;
  let paramTime = '';
  let remind_original = '';

  let ctx = agent.context.get('reminder_create-settime-followup');
  console.log('0000', JSON.stringify(ctx));
  try {
    let date = ctx.parameters.date_time;
    if (date == 'today') {
      date = new Date();
    } else {
      date = new Date(date);
    }
    paramTime = new Date(ctx.parameters.time);
    paramTime.setDate(date.getDate());

    let pos = ctx.parameters.time.search(/\+\d{2}/gm);
    let off = parseInt(ctx.parameters.time.substr(pos,3));
    remind_original = new Date(new Date(paramTime).setHours(paramTime.getHours() + off));
  } catch (e) {
    console.log('\n incorrect time', e, ctx.parameters);
    agent.add('Cannot get time');
    agent.setFollowupEvent('reminder_create_set_text');
    agent.context.set({ 'name': 'reminder_create-settime-followup', 'lifespan': 1 })

    return;
  }

  let fbId = agent.originalRequest.payload.data.sender.id;

  // send confirm dialog
  agent.context.set({ 'name': 'done', 'lifespan': 1, 'parameters': { 'text': text, 'time': paramTime, 'facebook_sender_id': fbId } })
  agent.fb.ReminderCreateConfirm(fbId, { text: text, time: paramTime, remind_original: remind_original.toLocaleString() });
  agent.add('choose');
}

function remindActions(agent) {
  let uid = agent.originalRequest.payload.data.sender.id;

  console.log('\n --act--', agent.query, uid);

  let query = JSON.parse(agent.query);

  // save reminder to db
  if (query.type == 'save') {
    let text = query.alert.text;
    let time = query.alert.time;
    let remind_original = query.remind_original;

    let reminder = {
      text: text,
      time: time,
      user_id: uid,
      remind_original: remind_original,
    }

    agent.db.Create(reminder);

  }

  // delete reminder
  if (query.type == 'delete' || query.type == 'confirm') {
    agent.db.DeleteByID(query.alert.id, uid);
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

