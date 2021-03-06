var config = require('./../config.json');
var pgp = require("pg-promise")(/*options*/);
var db = pgp(`postgres://${config.pg_user}:${config.pg_passwd}@${config.pg_address}/${config.pg_db}`);

var reminder = {
    id: null,
    text: '',
    user_id: null,
    time: null
}

let Reminders = {
    Create: function (reminder) {
        console.log(reminder)
        return db.none(
            'INSERT INTO reminders(text, user_id, remind_at,remind_original)' +
            'VALUES(${text}, ${user_id}, ${time},${remind_original})',
            reminder)
            .catch(function (error) {
                console.log("INSERT ERROR:", error, reminder);
            });
    },
    SnoozeByID: function (id) {
        return db.none('UPDATE reminders SET snoozed = true WHERE id = $1', id)
            .catch(function (error) {
                console.log("SNOOZE ERROR:", error, id);
            });
    },
    DeleteByID: function (id, uid) {
        return db.none('DELETE FROM reminders WHERE id = $1 AND user_id =$2;', [id, uid])
            .catch(function (error) {
                console.log("DELETE ERROR:", error, id);
            });
    },
    DeleteAllByUser: function (user_id) {
        return db.none('DELETE FROM reminders WHERE user_id = $1', user_id)
            .catch(function (error) {
                console.log("DELETE ALL ERROR:", error, user_id);
            });
    },
    GetByUser: async function (user_id) {
        let result = await db.any('SELECT * FROM reminders WHERE user_id = $1 AND remind_at::date < current_date + 1', user_id);
        return result;
    },
    GetExpired: async function () {
        console.log('>>>>--', config.snooze_period);
        let result = await db.any("SELECT * FROM reminders" +
            " WHERE (remind_at < now() AND snoozed = false) OR " +
            " (remind_at + interval $1 < now() AND snoozed = true);", config.snooze_period);

        return result;
    },
    CreateUser: function (uid, user) {
        console.log('--user', uid, user);
        return db.none(
            'INSERT INTO users(user_id, timezone)' +
            'VALUES(${id}, ${timezone})',
            user)
            .catch(function (error) {
                console.log("INSERT ERROR:", error, reminder);
            });
    },
    GetUser: async function (user_id) {
        let result = await db.any('SELECT * FROM users WHERE user_id = $1', user_id);
        return result;
    },
}

exports.Reminders = exports.default = Reminders;
