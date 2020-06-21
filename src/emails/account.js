const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Welcome to the Task App!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Sad to see you go!',
        text: `It's a shame to see you go, ${name}. Is there anything we could've done to keep you onboard?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}