import express from 'express';
import router from '../routes/index';
import request from 'supertest';

const app = express();
app.use('/', router);


describe('Basic route test', () => {
    it('should load the test route', async () => {
        const response = await request(app).get('/test-api');
        expect(response.status).toBe(200);
        expect(response.body.test).toBe("This is an API test");
    });
});