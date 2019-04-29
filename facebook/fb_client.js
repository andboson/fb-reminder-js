const { MessengerClient } = require('messaging-api-messenger');
const config = require('./../config.json');

let fbToken = function () {
    return config.fb_token
}


const menuActions = [
    {
        type: 'postback',
        title: 'Create reminder',
        payload: 'reminder_create',
    },
    {
        type: 'postback',
        title: 'Reminders for today',
        payload: 'show_today',
    },
    {
        type: 'postback',
        title: 'Delete all reminders',
        payload: 'delete_all',
    },
];

let FBClient = {
    client: {},
    New: function () {
        this.client = MessengerClient.connect(fbToken());

        return this;
    },
    ReminderCreateConfirm: function (uid, reminder) {
        let resp = this.client.sendGenericTemplate(
            uid,
            [
                {
                    title: 'Confirm save reminder',
                    subtitle: `Time: ${reminder.remind_original} \n Text: ${reminder.text}`,
                    buttons: [
                        {
                            type: 'postback',
                            title: 'save',
                            payload: JSON.stringify({
                                alert: reminder,
                                type: 'save'
                            }),
                        },
                        {
                            type: 'postback',
                            title: 'cancel',
                            payload: 'cancel',
                        },
                    ]
                }
            ],
            {
                //  tag: 'CONFIRMED_EVENT_REMINDER'
            });

        return resp;
    },
    ReminderAlert: function (uid, reminder) {
        let buttons = [
            {
                type: 'postback',
                title: 'confirm',
                payload: JSON.stringify({
                    alert: reminder,
                    type: 'confirm'
                }),
            },
        ]

        // add snooze btn only if reminder is not snoozed
        if (!reminder.snoozed) {
            buttons.push({
                type: 'postback',
                title: 'snooze',
                payload: JSON.stringify({
                    alert: reminder,
                    type: 'snooze'
                }),
            });
        }

        let resp = this.client.sendGenericTemplate(
            uid,
            [
                {
                    title: reminder.text,
                    subtitle: 'You have an alert for your reminder!',
                    buttons: buttons,
                }
            ],
            {
                tag: 'CONFIRMED_EVENT_REMINDER'
            });

        return resp;
    },
    SetChatProfile: function () {
        this.client.setMessengerProfile({
            get_started: {
                payload: 'show_menu',
            },
            "greeting": [
                {
                    "locale": "default",
                    "text": "Welcome to Reminder, {{user_full_name}}!"
                },
                {
                    "locale": "en_US",
                    "text": "Hello {{user_full_name}}!. I will try to help you!"
                }
            ],
            persistent_menu: [
                {
                    locale: 'default',
                    composer_input_disabled: false,
                    call_to_actions: menuActions
                },
            ],
        });
    },
    ShowMenu: function (uid) {
        let resp = this.client.sendGenericTemplate(
            uid,
            [
                {
                    title: '  Reminder menu',
                    // subtitle: 'sort of action with you reminders',
                    buttons: menuActions
                }
            ],
        );

        return resp;
    },
    ShowReminders: function (uid, reminders) {
        let items = [];
        reminders.forEach(element => {
            items.push({
                title: element.text,
                subtitle: 'on: ' + remind_original,
                buttons: [
                    {
                        type: 'postback',
                        title: 'delete',
                        payload: JSON.stringify({ alert: element, type: 'delete' }),
                    },
                ]
            });
        });

        console.log(JSON.stringify(items));
        let resp = this.client.sendGenericTemplate(
            uid,
            items,
            {
                tag: 'CONFIRMED_EVENT_REMINDER'
            });

        return resp;
    },
    GetUserProfile: function (uid) {  
        let resp = this.client.getUserProfile(
            uid,
            ['id','timezone']);

        return resp;
    },
};

exports.FBClient = exports.default = FBClient;