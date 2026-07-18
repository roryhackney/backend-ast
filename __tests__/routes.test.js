import request from 'supertest';
import app from '../app';
import 'dotenv/config';
import Code2FAModel from '../models/codes2FA.js';

describe('Basic route test', () => {
    it('should load the test route', async () => {
        const response = await request(app).get('/test-api');
        expect(response.status).toBe(200);
        expect(response.body.test).toBe("This is an API test");
    });
});

describe('Login test', () => {
    //should not be 500 / error, should be 401 for unauthorized
    it('should not error with no body', async () => {
        const response = await request(app).post('/login');
        expect(response.status).toBe(401);
    });

    it('should not error with only username', async () => {
        const response = await request(app).post('/login').send({"username": process.env.ADMIN_USERNAME});
        expect(response.status).toBe(401);
    });

    it('should not error with only password', async () => {
        const response = await request(app).post('/login').send({"password": process.env.ADMIN_PASSWORD});
        expect(response.status).toBe(401);
    });

    it('should not log in with invalid admin username', async () => {
        const response = await request(app).post('/login').send({"username": "an-invalid-username", "password": process.env.ADMIN_PASSWORD});
        expect(response.status).toBe(401);
    });

    it('should not log in with invalid admin password', async () => {
        const response = await request(app).post('/login').send({"username": process.env.ADMIN_USERNAME, "password": "an-invalid-password"});
        expect(response.status).toBe(401);
    });

    it('should log in with valid username and password', async () => {
        const body = {username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD};
        const response = await request(app).post('/login').send(body);
        expect(response.status).toBe(200);
    });
});

describe('2FA Verification test', () => {
    it('should not error with no body', async () => {
        const response = await request(app).post('/verify2FA');
        expect(response.status).toBe(401);
    });

    it('should not error with no code', async () => {
        const response = await request(app).post('/verify2FA').send({});
        expect(response.status).toBe(401);
    });

    it('should not verify incorrect code', async () => {
        const response = await request(app).post('/verify2FA').send({"code": -100000});
        expect(response.status).toBe(401);
    });

    it('should verify correct code within window', async () => {
        const body = {username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD};
        const loginResponse = await request(app).post('/login').send(body);
        expect(loginResponse.status).toBe(200);

        const query = Code2FAModel.find().sort("-timestamp").limit(1);
        const codes = await query.exec();
        let VALID_CODE = null;
        if (codes.length > 0) VALID_CODE = codes[0].code;

        expect(VALID_CODE).not.toBeNull();
        const verifyBody = {"code": VALID_CODE};
        const response = await request(app).post('/verify2FA').send(verifyBody);
        expect(response.status).toBe(200);

        const cookie = response.get("Set-Cookie");
        expect(cookie).not.toBeNull();

        const secureResponse = await request(app).get('/secure-api').set("Cookie", cookie);
        expect(secureResponse.status).toBe(200);
    });
});

describe("Verify session test", () => {
    it("should not verify if not logged in", async () => {
        const response = request(app).get("/verifySession").send();
        return response.then(res => expect(res.status).toBe(401));
    });

    it("should verify if logged in", async () => {
        await request(app).post('/login').send({username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD});
        const codes = await (Code2FAModel.find().sort("-timestamp").limit(1)).exec();
        const VALID_CODE = codes.length > 0 ? codes[0].code : null;
        const response2FA = await request(app).post('/verify2FA').send({code: VALID_CODE});
        expect(response2FA.status).toBe(200);
        const cookie = response2FA.get("Set-Cookie");
        expect(cookie).toBeTruthy();

        const response = await request(app).get("/verifySession").set("Cookie", cookie);
        return expect(response.status).toBe(200);
    });

    it("should not verify if token is not in db", async () => {
        return request(app).get("/verifySession").set("Cookie", ["token=AN_INVALID_TOKEN"])
        .then(result => expect(result.status).toBe(401));
    });
});