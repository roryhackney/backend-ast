import request from 'supertest';
import app from '../app';
import 'dotenv/config';


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
        expect(response.get("Set-Cookie")).toBeDefined();
    });
});

describe('Secure route test', () => {
    it('should block users not logged in', async () => {
        const response = await request(app).get('/secure-api');
        expect(await response.status).toBe(401);
    });

    it('should allow users that are logged in', async () => {
        //login
        const body = {username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD};
        const loginResponse = await request(app).post('/login').send(body);
        const cookie = loginResponse.get("Set-Cookie");

        //check route
        const response = await request(app).get('/secure-api').set("Cookie", cookie);
        expect(response.status).toBe(200);
        expect(response.body.superSecret).toBe('encryptedstring');
    });
});