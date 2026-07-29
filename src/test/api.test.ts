import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('auth', () => {
  it('logs in with valid seeded credentials', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'admin@vulkangym.com', password: 'vulkan2026' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.session.role).toBe('admin');
  });

  it('rejects an invalid password', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'admin@vulkangym.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('members', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/members');
    expect(res.status).toBe(401);
  });

  it('lists seeded members for an authenticated admin', async () => {
    const login = await request(app).post('/auth/login').send({ email: 'admin@vulkangym.com', password: 'vulkan2026' });
    const res = await request(app).get('/members').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find((m: { id: string }) => m.id === 'm1')).toBeTruthy();
  });

  it('blocks a member from deleting another member', async () => {
    const login = await request(app).post('/auth/login').send({ email: 'andres.reyes@gmail.com', password: 'vulkan2026' });
    const res = await request(app).delete('/members/m2').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(403);
  });
});

describe('classes', () => {
  it('rejects a class whose schedule clashes with the trainer\'s existing class', async () => {
    const login = await request(app).post('/auth/login').send({ email: 'admin@vulkangym.com', password: 'vulkan2026' });
    const res = await request(app)
      .post('/classes')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ name: 'Choque', category: 'Fuerza', trainerId: 't1', day: 'Lun', startTime: '07:30', durationMin: 30, capacity: 10 });
    expect(res.status).toBe(409);
  });
});

describe('error handling', () => {
  it('returns a clean 400 instead of a raw 500 when a referenced id does not exist', async () => {
    const login = await request(app).post('/auth/login').send({ email: 'admin@vulkangym.com', password: 'vulkan2026' });
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ memberId: 'no-existe', amount: 49, date: '2026-07-29', plan: 'Pro', status: 'pagado' });
    expect(res.status).toBe(400);
    expect(res.body.error).not.toMatch(/interno del servidor/i);
  });
});
