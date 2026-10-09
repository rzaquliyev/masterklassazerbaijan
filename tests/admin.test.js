import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import { createTestDb } from './helpers/testDb.js';
import { createApp } from '../src/app.js';

// Hər HTTP sorğusu arasında cookie-ni əllə daşıyan sadə köməkçi (extra asılılıq lazım deyil).
function makeClient(baseUrl) {
  let cookie = '';
  return {
    async request(path, { method = 'GET', body, redirect = 'manual' } = {}) {
      const headers = { Cookie: cookie };
      if (body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const res = await fetch(baseUrl + path, { method, headers, body, redirect });
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';')[0];
      return res;
    },
    get cookie() { return cookie; },
  };
}

describe('admin panel (routes/admin.js)', () => {
  let server; let baseUrl; let db;
  let ownerCsrf; let staffCsrf;
  const ownerClient = () => makeClient(baseUrl);
  const staffClient = () => makeClient(baseUrl);

  before(async () => {
    db = await createTestDb();
    const ownerId = randomUUID();
    const staffId = randomUUID();
    await db.query('INSERT INTO admin_users (id, email, password_hash, role) VALUES ($1,$2,$3,$4)', [
      ownerId, 'owner@test.az', await argon2.hash('owner-password-123'), 'owner',
    ]);
    await db.query('INSERT INTO admin_users (id, email, password_hash, role) VALUES ($1,$2,$3,$4)', [
      staffId, 'staff@test.az', await argon2.hash('staff-password-123'), 'staff',
    ]);

    const app = await createApp(db);
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  async function loginAs(email, password) {
    const client = makeClient(baseUrl);
    const res = await client.request('/admin/login', {
      method: 'POST',
      body: new URLSearchParams({ email, password, next: '/admin' }),
    });
    const loginPage = await client.request('/admin/bookings');
    const html = await loginPage.text();
    const csrfMatch = html.match(/name="_csrf" value="([^"]+)"/);
    return { client, status: res.status, csrf: csrfMatch ? csrfMatch[1] : null };
  }

  test('qorunan səhifəyə sessiyasız giriş login-ə yönləndirir', async () => {
    const client = makeClient(baseUrl);
    const res = await client.request('/admin/bookings');
    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /\/admin\/login/);
  });

  test('səhv parolla giriş rədd edilir, sessiya cookie-si qoyulmur', async () => {
    const client = makeClient(baseUrl);
    const res = await client.request('/admin/login', {
      method: 'POST',
      body: new URLSearchParams({ email: 'owner@test.az', password: 'tamamile-sehv' }),
    });
    assert.equal(res.status, 401);
    assert.equal(client.cookie, '');
  });

  test('düzgün parolla giriş sessiya cookie-si yaradır və idarə panelinə icazə verir', async () => {
    const { client, status } = await loginAs('owner@test.az', 'owner-password-123');
    assert.equal(status, 302);
    assert.ok(client.cookie.startsWith('admin_sid='));
    const dashboard = await client.request('/admin');
    assert.equal(dashboard.status, 200);
  });

  test('CSRF tokeni səhv olan POST sorğusu 403 ilə rədd edilir', async () => {
    const { client } = await loginAs('owner@test.az', 'owner-password-123');
    const res = await client.request('/admin/customers/00000000-0000-0000-0000-000000000000/notes', {
      method: 'POST',
      body: new URLSearchParams({ _csrf: 'yalnish-token', notes: 'test' }),
    });
    assert.equal(res.status, 403);
  });

  test('staff rolu owner-yalnız səhifələrə (export, istifadəçilər, jurnal) icazəsizdir', async () => {
    const { client } = await loginAs('staff@test.az', 'staff-password-123');
    const exportRes = await client.request('/admin/export/bookings.csv');
    const usersRes = await client.request('/admin/users');
    const auditRes = await client.request('/admin/audit');
    assert.equal(exportRes.status, 403);
    assert.equal(usersRes.status, 403);
    assert.equal(auditRes.status, 403);

    // amma adi bronlar səhifəsinə icazəsi var
    const bookingsRes = await client.request('/admin/bookings');
    assert.equal(bookingsRes.status, 200);
  });

  test('owner rolu export/istifadəçilər/jurnal səhifələrinə tam icazəlidir', async () => {
    const { client } = await loginAs('owner@test.az', 'owner-password-123');
    const exportRes = await client.request('/admin/export/bookings.csv');
    const usersRes = await client.request('/admin/users');
    assert.equal(exportRes.status, 200);
    assert.equal(usersRes.status, 200);
    assert.match(exportRes.headers.get('content-type'), /text\/csv/);
    const csvBuf = Buffer.from(await exportRes.arrayBuffer());
    assert.equal(csvBuf[0], 0xef);
    assert.equal(csvBuf[1], 0xbb);
    assert.equal(csvBuf[2], 0xbf); // UTF-8 BOM (Excel-də Azərbaycan hərfləri üçün)
  });

  test('çıxışdan sonra köhnə sessiya cookie-si artıq işləmir', async () => {
    const { client } = await loginAs('owner@test.az', 'owner-password-123');
    const dashboardPage = await client.request('/admin');
    const html = await dashboardPage.text();
    const csrf = html.match(/name="_csrf" value="([^"]+)"/)[1];

    const logoutRes = await client.request('/admin/logout', { method: 'POST', body: new URLSearchParams({ _csrf: csrf }) });
    assert.equal(logoutRes.status, 302);

    const afterLogout = await client.request('/admin/bookings');
    assert.equal(afterLogout.status, 302);
    assert.match(afterLogout.headers.get('location'), /\/admin\/login/);
  });
});
