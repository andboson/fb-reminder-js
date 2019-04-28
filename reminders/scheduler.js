var schedule = require('node-schedule');

let Scheduler = {
    Start: function (fbClient, db) {
        var job = schedule.scheduleJob('* * * * *', function () {
            console.log('=== start job ===');

            db.GetExpired().then(data => {
                if (data.length > 0) {
                    data.forEach(element => {
                        fbClient.ReminderAlert(element.user_id, element);
                    });
                }
            }).
                catch(error => {
                    console.log('\n job db error:', error);
                });
        });

        return job;
    },
    Stop: function (job) {
        return job.cancel();
    }

}

exports.Scheduler = exports.default = Scheduler;
