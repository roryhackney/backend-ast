import {
    check2FA, 
    checkLoggedInToken, 
    deleteExpired, 
    deleteSession,
    generateSessionToken, 
    hasIPRateLimitBeenReached, 
    minutes, 
    send2FA, 
    storeSession, 
} from '../helpers/security';
import {beforeAll, describe, expect, jest} from '@jest/globals';
import Code2FAModel from '../models/codes2FA.js';

const ACTUALLY_SEND_EMAILS = false; //change to true to run email tests
const ACTUALLY_STORE_IN_DB = false; //change to true to run db store tests

const ONE_MINUTE = minutes(1);
const FIVE_MINUTES = minutes(5);
const TEN_MINUTES = minutes(10);

describe('Minute calculation test', () => {
    it('Should convert minutes into milliseconds', () => {
        expect(ONE_MINUTE).toBe(60000);
        expect(FIVE_MINUTES).toBe(300000);
        expect(TEN_MINUTES).toBe(600000);
    });
});

describe('IP rate limiting test', () => {
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
        await new Promise(resolve => setTimeout(resolve, 501));
        expect(hasIPRateLimitBeenReached(IP, 500, MAX_ATTEMPTS)).toBe(false);
        expect(hasIPRateLimitBeenReached(IP, 500, MAX_ATTEMPTS)).toBe(true);
    });
});

// Application successfully inserts new codes into db and emails the code to admin.
describe('send2FA should send email with new 2FA code and store it in database', () => {
    it('should send email successfully', async () => {
        const result = await send2FA(ACTUALLY_SEND_EMAILS, false);
        expect(result).not.toBe(-1);
    });

    it('should store in db successfully', async () => {
        const result = await send2FA(false, ACTUALLY_STORE_IN_DB);
        expect(result).not.toBe(-1);
    });
});

describe('check2FA should verify entered code against db stored code and timestamp', () => {
    let INCORRECT_CODE = -1;
    let VALID_CODE = -1;
    let EXPIRED_CODE = -1;

    beforeAll(async () => {
        VALID_CODE = await send2FA(false, true);
        EXPIRED_CODE = await send2FA(false, true, 0);
        INCORRECT_CODE = VALID_CODE + 1;
    });
    
    it('should pass if the code is correct within window', async () => {
        expect(VALID_CODE).not.toBe(-1);
        const result = await check2FA(VALID_CODE);
        expect(result).toBe(true);
    });

    it('should fail if the code is incorrect within window', () => {
        expect(INCORRECT_CODE).not.toBe(-1);
        const result = await check2FA(INCORRECT_CODE);
        expect(result).toBe(false);
    });

    it('should fail if the window has expired', async () => {
        expect(EXPIRED_CODE).not.toBe(-1);
        const result = await check2FA(EXPIRED_CODE);
        expect(result).toBe(false);
    });
});

describe('storeSession should store session info in the database given a valid token', () => {
    it('should not store without a token', () => {
        const result = await storeSession(undefined, ONE_MINUTE, '1.1.1.1', false);
        expect(result).toBe(false);
    });

    it('should not store an empty token', () => {
        const res = await storeSession('', ONE_MINUTE, '1.1.1.1', false);
        expect(res).toBe(false);
    });

    it('should store a valid token', () => {
        const res = await storeSession('ABCDEFGH01823821VIJK28218L', ONE_MINUTE, '1.1.1.1', false);
        expect(res).toBe(true);
    });
});

describe("Check logged in token from cookie", () => {
    it('should fail with no token', async () => {
        const res = await checkLoggedInToken();
        expect(res).toBe(false);
    });

    it('should fail with empty token', async () => {
        const res = await checkLoggedInToken('');
        expect(res).toBe(false);
    });

    it('should fail with incorrect token', async () => {
        const res = await checkLoggedInToken('AN0INVALID0TOKEN');
        expect(res).toBe(false);
    });

    it('should succeed with correct token', async () => {
        const TOKEN = 'ABCDEFGH01823821VIJK28218L';
        await storeSession(TOKEN, ONE_MINUTE, '1.1.1.1', false);
        const res = await checkLoggedInToken(TOKEN);
        expect(res).toBe(true);
    });
});

describe("Delete expired should delete successfully", () => {
    const NO_WINDOW = 0;
    it('should delete expired sessions', async () => {
        await storeSession("ABC123", NO_WINDOW, '1.1.1.1', false);
        const count = await deleteExpired(true, false);
        expect(count).toBeGreaterThan(0);
    });

    it('should delete expired tokens', async () => {
        await send2FA(false, true, NO_WINDOW);
        const count = await deleteExpired(false, true);
        expect(count).toBeGreaterThan(0);
    });
});

describe("Delete session should delete the session", () => {
    it('should not delete with no token', async () => {
        const res = await deleteSession();
        expect(res).toBe(false);
    });

    it('should not delete with valid but not present token', () => {
        const res = await deleteSession("ABCD012345667");
        expect(res).toBe(false);
    });

    it('should delete a present token', () => {
        const token = generateSessionToken();
        const res = await storeSession(token, TEN_MINUTES, '1.1.1.1', false);
        expect(res).toBe(true);
        const resDel = await deleteSession(token);
        expect(resDel).toBe(true);
    });
})