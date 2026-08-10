# Backend REST API for my art supply tracker
This is a project to track my art supplies
Kinda going down a rabbit hole with authentication but oh well

## Status Codes
200 - OK
401 - Invalid credentials
500 - Application error

## Security Features

--Private (helpers)--

### generateRandomCode(): Number
Returns random integer between 100,000 and 999,999 (inclusive)

### async sendEmailCode2FA(code, date): Boolean
code: Number, date: String
Sends email to admin with 2FA code and human readable date/time
Returns true if the email was successfully sent

### async sendEmailSuccess2FA(): Boolean
Sends email to admin confirming successful 2FA code was entered and user session was created
Returns true if the email was successfully sent

### async storeDBCode2FA(code, timestamp, window): Boolean
code: Number, timestamp: Number, window: Number
Stores the 2FA code in the database with timestamp and expiresAt (timestamp + window)
Returns true if it was successfully stored

--Public--

### minutes(minutes): Number
minutes: Number
Returns the integer conversion of minutes to milliseconds

### hasIPRateLimitBeenReached(ip, window, maxAttempts, endpoint): Boolean
ip: String, window=minutes(10): Number, maxAttempts=50: Number, endpoint="/login": String
Returns true if IP has made maxAttempts+ attempts to use endpoint within window

### async send2FA(actuallySend, actuallyStore, window): Number
actuallySend=true: Boolean, actuallyStore=true: Boolean, window=TEN_MINUTES: Number
Generates a 2FA code, stores it in the database with timestamp and expiresAt (timestamp + window) if actuallyStore, and sends it to the admin email if actuallySend with the timestamp it was created at.
Returns the code, or -1 if the code failed to be stored in the database

### async check2FA(enteredCode): Boolean
Retrieves 2FA code and expiresAt from the database and checks it against the enteredCode
Returns true if the enteredCode matches the database and now <= expiresAt

### checkLogin(user, pass): Boolean
user: String, pass: String
Returns true if the user and pass match the admin username and password

### async storeSession(token, window, ip, sendEmail): Boolean
token: String, window: Number, ip: String, sendEmail=true: Boolean
Stores a new Session in the database, sends success to admin email if sendEmail
Returns true if new session was successfully stored and emailed

### async checkLoggedInToken(token): Boolean
token: String
Returns true if the token matches an unexpired Session in the database

### async deleteExpired(deleteSessions, delete2FAs): Number
Deletes expired Sessions from the database if deleteSessions and 2FA codes if delete2FAs
Returns the Number of deleted documents

## Routes

### Login (/login) POST
Checks if req.body contains admin credentials and returns status code.

### Verify 2FA (/verify2FA) POST
Checks if req.body contains a valid 2FA code that is not expired. If so, sets user session in cookie and database. Sends status code (200/401/500).

### Verify Session (/verifySession) GET
Checks user session exists and cookie matches database. Returns status code (200/401).

--In progress--

### Logout (/logout) GET
Clears session cookie and deletes it from the database, logging out the user.

### Delete Expires Sessions and 2FAs (/deleteExpiredSessionsAnd2FAs) GET
Removes old session codes and 2FA codes from the database.

## Models
--Helpers--
validateInteger: contains validator for integers for use in schemas

--Security--

### 2FA Codes (codes2FA)
code: Integer (100000-999999), required
timestamp: Integer (0+), required

### Session
token: String, required
createdAt: Integer, required
expiresAt: Integer, required
address: String, required

--Art Supplies--

### Art Supply (artsupply)
name: String, required
description: String, required
type: Type, required
location: Location, required
brand: Brand
itemImagePath: String
demoImagePath: String
quality: Integer (1-5)
quantity: Integer (0-100), required
onWishlist: Boolean, default=false, required

### Brand
name: String, required
description: String, required

### Category
name: String, required
description: String, required

### Defaults
brand: Brand
type: Type, required
description: required
location: Location, required
itemImagePath
demoImagePath
quality: Integer (1-5)
fields: Array of {field: Field, value: String or Number or Array of String}

### Field
name: String, required
description: String, required
isRequired: Boolean, required, default=False
inputType: Enum "text", "number", "color", "image", "radio", "checkboxes", required
options: Array of Strings (for checkboxes/radios with multiple options),
regex: String (for text inputs)
min: Number (for numeric inputs)
max: Number
step: Number

### Location
name: String, required
description: String, required

### Type
name: String, required
description: String, required
category: Category, required
fields: Array of Fields