const { MessengerClient } = require('messaging-api-messenger');
const config = require('./../config.json');

let fbToken = function () {
    return config.fb_token
}

let FBClient = {
    ReminderAlert: function (uid, reminder) {
        let payload = {
            alert: reminder,
            type: 'confirm'
        }
        let payloadSnooze = {
            alert: reminder,
            type: 'snooze'
        }
        const client = MessengerClient.connect(fbToken());
        let resp = client.sendGenericTemplate(
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
    }
};

exports.FBClient = exports.default = FBClient;