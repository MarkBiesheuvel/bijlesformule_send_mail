// Libraries
var AWS = require('aws-sdk');
var ses = new AWS.SES();

// Parameters for SES
var params = {
    Destination: {
        ToAddresses: [
            'mail@markbiesheuvel.nl'
        ]
    },
    Message: {
        Body: {
            Html: {}
        },
        Subject: {}
    },
    Source: 'info@debijlesformule.nl'
};

var template = require('fs').readFileSync('./email.html', 'utf8');

var render = function (event) {
    var success = true;
    var result = template.replace(/{{ ([A-Za-z_-]+) }}/g, function (tag, name) {
        if (name in event) {
            return event[name]
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
        } else {
            success = false;
            console.log('Missing parameter: ' + name);
            return '';
        }
    });
    if (success) {
        return result;
    } else {
        return false;
    }
};

exports.handler = function (event, context) {

    console.log(event);

    var html = render(event);

    if (html === false) {
        context.fail("Missende gegevens");
        return;
    }

    params.Message.Body.Html.Data = html;
    params.Message.Subject.Data = 'Bericht van ' + event.name;
    params.ReplyToAddresses = [event.email];

    ses.sendEmail(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            context.fail("Email kan niet verzonden worden");
        }
        else {
            console.log(data);
            context.succeed("Bericht verzonden");
        }
    });

};

