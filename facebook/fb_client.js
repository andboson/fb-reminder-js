const { MessengerClient } = require('messaging-api-messenger');
const config = require('./../config.json');

let fbToken = function () {
    return config.fb_token
}

let FBClient = {
    client: {},
    New: function(){
        this.client = MessengerClient.connect(fbToken());

        return this;
    },
    ReminderAlert: function (uid, reminder) {
        let payload = {
            alert: reminder,
            type: 'confirm'
        }
        let payloadSnooze = {
            alert: reminder,
            type: 'snooze'
        }
        
        let resp = this.client.sendGenericTemplate(
            uid,
            [
                {
                    title: reminder.title,
                    subtitle: 'You have an alert for your reminder!',
                    buttons: [
                        {
                            type: 'postback',
                            title: 'confirm',
                            payload: JSON.stringify(payload),
                        },
                        {
                            type: 'postback',
                            title: 'snooze',
                            payload: JSON.stringify(payloadSnooze),
                        },
                    ]
                }
            ],
            {
                tag: 'CONFIRMED_EVENT_REMINDER'
            });

        return resp;
    },
    SetChatProfile: function(){
        this.client.setMessengerProfile({
            get_started: {
              payload: 'show_menu',
            },
            "greeting":[
                {
                  "locale":"default",
                  "text":"Welcome to Reminder, {{user_full_name}}!"
                }, 
                {
                  "locale":"en_US",
                  "text":"Hello {{user_full_name}}!. I will try to help you!"
                }
              ],
            persistent_menu: [
              {
                locale: 'default',
                composer_input_disabled: false,
                call_to_actions: [
                    {
                        type: 'postback',
                        title: 'Show all reminders',
                        payload: 'show_all',
                    },
                    {
                        type: 'postback',
                        title: 'Show reminders for today',
                        payload: 'show_today',
                    },
                    {
                        type: 'postback',
                        title: 'Delete all reminders',
                        payload: 'delete_all',
                    },
                ],
              },
            ],
          });
    },
    ShowMenu: function (uid) {         
        let resp = this.client.sendGenericTemplate(
            uid,
            [
                {
                    title: 'Reminder menu',
                    subtitle: 'sort of action with you reminders',
                    buttons: [
                        {
                            type: 'postback',
                            title: 'Show all',
                            payload: 'show_all',
                        },
                        {
                            type: 'postback',
                            title: 'Show for today',
                            payload: 'show_today',
                        },
                        {
                            type: 'postback',
                            title: 'Delete all',
                            payload: 'delete_all',
                        },
                    ]
                }
            ],
            );

        return resp;
    },
};

exports.FBClient = exports.default = FBClient;