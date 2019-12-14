const nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
module.exports = nodemailer.createTransport({
    host: process.env.NM_HOST,
    port: process.env.NM_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.NM_USER,
        pass: process.env.NM_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});