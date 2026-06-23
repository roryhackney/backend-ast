import {minutes, hasIPRateLimitBeenReached, send2FA, check2FA, storeSession, checkLoggedInToken} from '../helpers/security';
import {describe, expect, jest} from '@jest/globals';
import Code2FAModel from '../models/codes2FA.js';

const ONE_MINUTE = minutes(1);
const FIVE_MINUTES = minutes(5);

describe('Minute calculation test', () => {
    it('Should convert minutes into milliseconds', () => {
        expect(ONE_MINUTE).toBe(60000);
        expect(FIVE_MINUTES).toBe(60000 * 5);
    });
});

describe('IP rate limiting test', () => {
    // jest.useFakeTimers();
    const ONE_MINUTE = minutes(1);
    
    it('should block attempts if MAX_ATTEMPTS is 0', () => {
        const IP = '1.1.1.1';
        const MAX_ATTEMPTS = 0;
        expect(hasIPRateLimitBeenReached(IP, ONE_MINUTE, MAX_ATTEMPTS)).toBe(true);
    })

    it('should allow attempts <= MAX_ATTEMPTS within WINDOW', () => {
        const IP = '2.2.2.2';
        const MAX_ATTEMPTS = 5;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            expect(hasIPRateLimitBeenReached(IP, ONE_MINUTE, MAX_ATTEMPTS)).toBe(false);
        }
    });

    it('should prevent attempts > MAX_ATTEMPTS within WINDOW', () => {
        const IP = '3.3.3.3';
        const MAX_ATTEMPTS = 1;
        expect(hasIPRateLimitBeenReached(IP, ONE_MINUTE, MAX_ATTEMPTS)).toBe(false);
        expect(hasIPRateLimitBeenReached(IP, ONE_MINUTE, MAX_ATTEMPTS)).toBe(true);
    });

    it('should allow attempts again after WINDOW has expired', () => {
        const IP = '4.4.4.4';
        const MAX_ATTEMPTS = 1;
        expect(hasIPRateLimitBeenReached(IP, 500, MAX_ATTEMPTS)).toBe(false);
        expect(hasIPRateLimitBeenReached(IP, 500, MAX_ATTEMPTS)).toBe(true);
        return new Promise(resolve => setTimeout(resolve, 500))
        .then(() => {
            expect(hasIPRateLimitBeenReached(IP, 500, MAX_ATTEMPTS)).toBe(false);
            expect(hasIPRateLimitBeenReached(IP, 500, MAX_ATTEMPTS)).toBe(true);
        });
    });
});

// Application successfully inserts new codes into db and emails the code to admin.
describe('send2FA should send email with new 2FA code and store it in database', () => {
    // This passes - emails are sent successfully. Manual check also verifies. Commenting as don't want to send a bunch of emails every test run.
    it('should send email successfully', () => {
        const prom = send2FA(true, false);
        return prom.then((result) => {
            expect(result).toBe(true);
        });
    });

    // Passes, commenting so tests don't add test data to the db
    // TODO: Close the db connection when the application is shut down, not on logout as we need it to verify login
    it('should store in db successfully', () => {
        const prom = send2FA(false, true);
        return prom.then((result) => {
            expect(result).toBe(true);
        })
    });
})

// Passes, commenting so tests don't add test 2FA codes to the db
describe('check2FA should verify entered code against db stored code and timestamp', () => {
    send2FA(false, true);
    const query = Code2FAModel.find().sort("-timestamp").limit(1);
    const VALID_CODE = query.exec().then(res => {
        return res[0].code;
    });

    it('should pass if the code is correct within window', () => {
        //note that one minute is returning false due to window being too short for test
        //maybe should use five minutes+ for api (takes about 1.5 min for test to process)
        return VALID_CODE
            .then(code => check2FA(code, FIVE_MINUTES))
            .then(result => expect(result).toBe(true));
    });

    it('should fail if the code is incorrect within window', () => {
        return VALID_CODE
            .then(code => check2FA(code + 1, FIVE_MINUTES))
            .then(result => expect(result).toBe(false));
    });

    it('should fail if the window has expired', () => {
        setTimeout(
            () => {
                VALID_CODE
                    .then(code => send2FA(code, ONE_MINUTE - 1))
                    .then(result => expect(result).toBe(false))
            },
            ONE_MINUTE
        );
    });
});

// Passes, commenting so tests don't add test data to db
describe('storeSession should store session info in the database given a valid token', () => {
    it('should not store without a token', () => {
        return storeSession(undefined, ONE_MINUTE, '1.1.1.1')
        .then(result => expect(result).toBe(false));
    });

    it('should not store an empty token', () => {
        return storeSession('', ONE_MINUTE, '1.1.1.1')
        .then(res => expect(res).toBe(false));
    });

    it('should store a valid token', () => {
        return storeSession('ABCDEFGH01823821VIJK28218L', ONE_MINUTE, '1.1.1.1')
        .then(res => expect(res).toBe(true));
    });
});

describe("Check logged in token from cookie", () => {
    it('should fail with no token', async () => {
        return checkLoggedInToken().then(res => expect(res).toBe(false));
    });

    it('should fail with empty token', async () => {
        return checkLoggedInToken('').then(res => expect(res).toBe(false));
    });

    it('should fail with incorrect token', async () => {
        return checkLoggedInToken('AN0INVALID0TOKEN').then(res => expect(res).toBe(false));
    });

    it('should succeed with correct token', async () => {
        const TOKEN = 'ABCDEFGH01823821VIJK28218L';
        await storeSession(TOKEN, ONE_MINUTE, '1.1.1.1');
        return checkLoggedInToken(TOKEN).then(res => expect(res).toBe(true));
    });
});