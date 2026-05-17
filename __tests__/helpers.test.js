import {minutes, hasIPRateLimitBeenReached} from '../helpers/security';
import {jest} from '@jest/globals';

describe('Minute calculation test', () => {
    it('Should convert minutes into milliseconds', () => {
        const ONE_MINUTE = minutes(1);
        expect(ONE_MINUTE).toBe(60000);
        const FIVE_MINUTES = minutes(5);
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