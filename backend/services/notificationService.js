const sendEmail = (to, subject, text) => {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
};

const sendSMS = (to, message) => {
    console.log(`[SMS] To: ${to}, Message: ${message}`);
};

module.exports = { sendEmail, sendSMS };
