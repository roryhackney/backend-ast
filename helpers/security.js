import {createTransport} from 'nodemailer';
import {randomBytes} from 'node:crypto';
import 'dotenv/config';

import connect from '../models/connect.js';
import Code2FAModel from '../models/codes2FA.js';
import Session from '../models/session.js';

/**
 * Timer helper for IP blocking, etc. Converts minutes to MS.
 * @param {number} minutes - how many minutes to convert to MS
 * @returns the number of minutes converted to MS.
 */
export const minutes = (minutes) => 60000 * minutes;
const TEN_MINUTES = minutes(10);

/** Global IP tracking map */
const requestsFromIPs = {};

//Email transporter
const transporter = createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

/**
 * Checks if the IP has made too many attempts for the endpoint within the window
 * @param {String} ip IP address being checked
 * @param {number} [window=TEN_MINUTES] How long between resets of number of attempts in milliseconds, default=TEN_MINUTES
 * @param {number} [maxAttempts=50] How many attempts are allowed per window, default=50
 * @param {String} [endpoint="login"] Unique endpoint being tracked, default="login"
 * @returns If the IP has reached its limit within the window of attempts for the endpoint
 */
export const hasIPRateLimitBeenReached = (ip, window=TEN_MINUTES, maxAttempts=50, endpoint="login") => {
    const now = Date.now();

    //add ip to tracker
    if (! (ip in requestsFromIPs)) {
        requestsFromIPs[ip] = {};
    }
    if (! (endpoint in requestsFromIPs[ip])) {
        requestsFromIPs[ip][endpoint] = {timestamp: now, numAttempts: 0};
    }
    if (now - requestsFromIPs[ip][endpoint].timestamp > window) {
        requestsFromIPs[ip][endpoint] = {timestamp: now, numAttempts: 1};
        return false;
    }
    if (requestsFromIPs[ip][endpoint].numAttempts < maxAttempts) {
        requestsFromIPs[ip][endpoint].numAttempts++;
        return false;
    } else {
        return true;
    }
};

/**
 * Generates a random six digit code for 2FA
 * @returns Random six digit integer between 100,000 and 999,999
 */
const generateRandomCode = () => {
    //min 100,000, max 999,999 (MIN + floor(rand * (MAX + 1 - MIN)))
    return 100000 + Math.floor(Math.random() * 900000);
}

/**
 * Generates a random session token with given length for auth
 * @param {Number} [length=32] length of the token, default=32
 * @returns Random hex string with the given length
 */
export const generateSessionToken = (length = 32) => {
    return randomBytes(length).toString('hex').slice(0, length);
}

/**
 * Sends the 2FA code to the admin email address
 * @param {number} code 2FA code to be emailed
 * @param {String} date Datetime of 2FA request in human readable format
 * @returns True if successfully sent, false if failed to send
 */
const sendEmailCode2FA = async (code, date) => {
    const msg = 
`Hi, ${process.env.ADMIN_NAME}! Looks like you tried to log in at ${date}.
Your verification code is ${code}.
If this wasn't you, change the admin password right away and delete other sessions.`;
    //send email
    const content = {
        to: process.env.ADMIN_EMAIL,
        from: 'art-supply-tracker.com',
        subject: `Your verification code: ${code}`,
        text: msg
    };
    try {
        await transporter.sendMail(content);
        return true;
    } catch (err) {
        return false;
    }
}

/** Sends a verification email to the admin email confirming successful 2FA verification */
const sendEmailSuccess2FA = async () => {
    const content = {
        to: process.env.ADMIN_EMAIL,
        from: 'art-supply-tracker.com',
        subject: `Successful login`,
        text: 
`Hi, ${process.env.ADMIN_NAME}!
You successfully logged in and verified 2FA at ${Date.now().toLocaleString()}.
If this wasn't you, change the admin password right away and delete other sessions.`
    };
    try {
        await transporter.sendMail(content);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Stores the requested 2FA code in the database for later checks
 * @param {number} code 2FA code to be stored
 * @param {number} timestamp When the login attempt was made in milliseconds
 * @param {number} window How long the 2FA code should be valid in milliseconds
 * @returns True if successful, false if not
 */
const storeDBCode2FA = async (code, timestamp, window) => {
    //store code in session document
    try {
        const entry = new Code2FAModel({code: code, createdAt: timestamp, expiresAt: timestamp + window});
        await entry.save();
        return true;
    } catch (err) {
        return false;
    }
};

/**
 * Sends a new 2FA code to the admin email and stores it in the db for checking later
 * @param {boolean} [actuallySend=true] Whether to actually send the email, default=true
 * @param {boolean} [actuallyStore=true] Whether to actually store the code in the database, default=true
 * @param {number} [window=TEN_MINUTES] How long the 2FA code should be valid in milliseconds, default=TEN_MINUTES
 * @returns The code, or -1 if it failed to store in the database.
 */
export const send2FA = async (actuallySend=true, actuallyStore=true, window=TEN_MINUTES) => {
    const date = new Date();
    const code = generateRandomCode();
    if (actuallyStore) {
        storeDBCode2FA(code, date.getTime(), window)
            .catch((err) => {
                return -1;
            });
    }
    if (actuallySend) {
        sendEmailCode2FA(code, date.toLocaleString());
    }

    return code;

};

/**
 * Checks if the correct 2FA code was entered in time
 * @param {number} enteredCode The verification code entered by the user, eg 123456
 * @returns Whether the correct 2FA was entered within the time limit
 */
export const check2FA = async (enteredCode) => {
    const query = Code2FAModel.find({code: enteredCode}).sort("-expiresAt");
    return query.exec().then(codeEntries => {
        if (codeEntries.length === 0) {
            return false;
        } else {
            if (Date.now() <= codeEntries[0].expiresAt) {
                return true;
            }
            return false;
        }
    });
}

/** 
 * Checks if the entered username and password are correct
 * @param {String} user the username to be checked
 * @param {String} pass the password to be checked
 * @returns Whether the correct username and password were entered
 */
export const checkLogin = (user, pass) => {
    const result = (user && pass &&
        user === process.env.ADMIN_USERNAME && 
        pass === process.env.ADMIN_PASSWORD);
    return !! result;
};

/**
 * Stores the session token in the database for later checks
 * @param {String} token Session token to be stored
 * @param {number} window How long the session is valid in milliseconds
 * @param {String} ip IP address for the session
 * @param {Boolean} [sendEmail=true] Whether to send confirmation email to admin, default=true
 * @returns True if successful, false if not
 */
export const storeSession = async (token, window, ip, sendEmail=true) => {
    const now = Date.now();
    if (token) {
        try {
            const entry = new Session({token: token, createdAt: now, expiresAt: now + window, address: ip});
            await entry.save();
            if (sendEmail) sendEmailSuccess2FA();
            return true;
        } catch (err) {
            return false;
        }
    }
    return false;
};

/**
 * Checks that the given token matches the session token stored in the database and is not expired
 * @param {*} token Token to be checked
 * @returns Whether the token is correct and not expired
 */
export const checkLoggedInToken = async (token) => {
    if (! token) return false;
    const query = Session.find({token: token}).sort("-expiresAt").limit(1);
    return query.exec().then(res => {
        if (res.length === 0 || res[0].expiresAt < Date.now()) return false;
        return true;
    });
};

/**
 * Deletes all sessions and 2FA codes that have expired from the database
 * @param {*} deleteSessions if sessions should be deleted, default=true
 * @param {*} delete2FAs if 2FA codes should be deleted, default=true
 * @returns how many documents were deleted
 */
export const deleteExpired = async(deleteSessions=true, delete2FAs=true) => {
    const now = Date.now();
    let sessionCount = 0;
    let codeCount = 0;
    if (deleteSessions) {
        sessionCount = await Session.deleteMany({"expiresAt": {$lt: now}})
            .then((result) => {
                return result ? result.deletedCount : 0;
            });
    }
    if (delete2FAs) {
        codeCount = await Code2FAModel.deleteMany({"expiresAt": {$lt: now}})
            .then((result) => {
                return result ? result.deletedCount : 0;
            });
    }
    return sessionCount + codeCount;
};

/**
 * Deletes sessions with the given token from the database
 * @param {*} token session token to be deleted
 * @returns True if the session was deleted, else false
 */
export const deleteSession = async (token) => {
    if (token) {
        return await Session.deleteMany({"token": token})
            .then((result) => {
                const count = result.deletedCount ?? 0;
                return count > 0;
            });
    }
    return false;
}
