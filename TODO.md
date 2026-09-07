//user flow
//All API routes should check hasIPRateBeenReached
//Authenticated routes should check checkLoggedInToken
//Unauth routes (eg /login) should not work if there is a token?
//1. enter username and password
//2. call login api
//3.
    // A - Failure and out of attempts - Display error and block further attempts
    // B - Failure - Redisplay login form and allow new attempts (go to step 1)
    // C - Success - Display 2FA input, email and store code, and call verify2FA api on enter (go to step 4)
//4.
    // A - Failure and out of attempts - Display error and block further attempts
    // B - Failure - Redisplay login form (go to step 1)
    // C - Success - Send verification email, store session/cookie with expiration set, and go to home (authenticated route)
//5.
    // On every page, checkLoggedInToken
    // On logout, delete all sessions with the token
    // Periodically, delete all expired cookies and sessions

## Security Features
- Shield each API with hasIPRateLimitBeenReached and checkLoggedInToken
- Set one week expiration on cookies

## AST Features
- Redesign art supply schemas/structure
- CRUD art supplies

## Other
- Backups of db
- Put API online and test with front end (eg cookies)

## Test Coverage

### Routes

[x] Login
[x] Verify 2FA
[x] Verify Session
[x] Logout
[x] Delete Expired

### Helpers
[x] Minutes
[x] HasIPRateLimitBeenReached
[x] GenerateRandomCode
[x] SendEmailCode2FA
[x] SendEmailSuccess2FA
[x] StoreDBCode2FA
[x] Send2FA
[x] Check2FA
[x] CheckLogin
[x] StoreSession
[x] CheckLoggedInToken
[x] DeleteExpired