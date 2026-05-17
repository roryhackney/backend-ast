/**
 * Timer helper for IP blocking, etc. Converts minutes to MS.
 * @param {number} minutes - how many minutes to convert to MS
 * @returns the number of minutes converted to MS.
 */
export const minutes = (minutes) => 60000 * minutes;
const TEN_MINUTES = minutes(10);

/** Global IP tracking map */
const requestsFromIPs = {};

/**
 * 
 * @param {String} ip IP address being checked
 * @param {number} window How long between resets of number of attempts (eg, ten minutes)
 * @param {number} maxAttempts How many attempts are allowed per window (eg, 50)
 * @param {String} endpoint Unique endpoint being tracked (eg, "login")
 * @returns if the IP has reached its limit within the window of attempts for the endpoint
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