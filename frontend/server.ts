import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Database, logSystemAction } from './server/db';
import {
  SPRING_BASE,
  ensureArray,
  getAuthHeaders,
  proxyToSpring,
  unwrapData,
  SpringApiResponse,
} from './server/springProxy';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const userEmail = (req.headers['x-user-email'] as string) || null;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const level = statusCode >= 400 ? 'warn' : 'info';
      const isSystemLogOrEmailPoll = req.url.includes('/api/logs') || req.url.includes('/api/emails');

      if (!isSystemLogOrEmailPoll) {
        logSystemAction(
          level,
          'api',
          userEmail,
          `API Response: ${req.method} ${req.url} -> HTTP ${statusCode} in ${duration}ms`,
          JSON.stringify({ method: req.method, url: req.url, statusCode, durationMs: duration })
        );
      }
    });

    next();
  });

  // ---- AUTH (Spring Boot) ----
  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          phone: String(req.body.phone || '').replace(/\D/g, ''),
        }),
      });
      const body = (await springRes.json()) as SpringApiResponse<{ token: string; user: unknown }>;
      if (!springRes.ok || !body.success || !body.data) {
        res.status(springRes.status).json({ error: body.message || 'Registration failed' });
        return;
      }
      res.status(201).json({ user: body.data.user, token: body.data.token });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/customer/login', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: req.body.email, password: req.body.password }),
      });
      const body = (await springRes.json()) as SpringApiResponse<{ token: string; user: unknown }>;
      if (!springRes.ok || !body.success || !body.data) {
        res.status(springRes.status).json({ error: body.message || 'Invalid credentials' });
        return;
      }
      res.status(200).json({ user: body.data.user, token: body.data.token });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/admin/login', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: req.body.email, password: req.body.password }),
      });
      const body = (await springRes.json()) as SpringApiResponse<{ token: string; user: unknown }>;
      if (!springRes.ok || !body.success || !body.data) {
        res.status(springRes.status).json({ error: body.message || 'Invalid admin credentials' });
        return;
      }
      res.status(200).json({ user: body.data.user, token: body.data.token });
    } catch (err) {
      next(err);
    }
  });

  // ---- HOTELS (Spring Boot) ----
  app.get('/api/hotels', async (req, res, next) => {
    try {
      const city = (req.query.city as string) || '';
      const params = new URLSearchParams();
      if (city.trim()) params.set('city', city.trim());
      params.set('available', 'true');
      const query = params.toString() ? `?${params.toString()}` : '';

      const springRes = await fetch(`${SPRING_BASE}/api/hotels${query}`);
      const body = (await springRes.json()) as SpringApiResponse<unknown[]>;
      const hotels = ensureArray(unwrapData(body));
      res.status(200).json({ hotels });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/hotels/:id', async (req, res, next) => {
    try {
      const params = new URLSearchParams();
      const checkIn = (req.query.checkIn as string) || '';
      const checkOut = (req.query.checkOut as string) || '';
      if (checkIn.trim()) params.set('checkIn', checkIn.trim());
      if (checkOut.trim()) params.set('checkOut', checkOut.trim());
      const query = params.toString() ? `?${params.toString()}` : '';

      const springRes = await fetch(`${SPRING_BASE}/api/hotels/${req.params.id}${query}`);
      const body = (await springRes.json()) as SpringApiResponse<unknown>;
      const hotel = unwrapData(body);
      if (!springRes.ok || !hotel) {
        res.status(springRes.status).json({ error: body.message || 'Hotel not found' });
        return;
      }
      res.status(200).json({ hotel });
    } catch (err) {
      next(err);
    }
  });

  // ---- BOOKINGS (Spring Boot) ----
  app.post('/api/bookings', async (req, res, next) => {
    try {
      const payload = {
        userId: Number(req.body.userId),
        hotelId: Number(req.body.hotelId),
        roomId: req.body.roomId ? Number(req.body.roomId) : null,
        checkInDate: req.body.checkIn || req.body.checkInDate,
        checkOutDate: req.body.checkOut || req.body.checkOutDate,
        guests: Number(req.body.guests),
      };

      const springRes = await fetch(`${SPRING_BASE}/api/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(req),
        body: JSON.stringify(payload),
      });
      const body = (await springRes.json()) as SpringApiResponse<unknown> & { message?: string };
      if (!springRes.ok) {
        res.status(springRes.status).json({ error: body.message || 'Booking failed' });
        return;
      }
      if (!body.success) {
        res.status(springRes.status).json({ error: body.message || 'Booking failed' });
        return;
      }
      res.status(201).json({ booking: body.data });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/bookings/:id/cancel', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/bookings/${req.params.id}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(req),
      });
      const body = (await springRes.json()) as SpringApiResponse<unknown>;
      if (!springRes.ok || !body.success) {
        res.status(springRes.status).json({ error: body.message || 'Cancel failed' });
        return;
      }
      res.status(200).json({ booking: body.data });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/bookings/my', async (req, res, next) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }
      const springRes = await fetch(`${SPRING_BASE}/api/bookings/my?userId=${userId}`, {
        headers: getAuthHeaders(req),
      });
      const body = (await springRes.json()) as SpringApiResponse<unknown[]>;
      const bookings = ensureArray(unwrapData(body));
      res.status(200).json({ bookings });
    } catch (err) {
      next(err);
    }
  });

  // ---- ADMIN (Spring Boot) ----
  app.get('/api/admin/stats', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/admin/stats`, { headers: getAuthHeaders(req) });
      const body = (await springRes.json()) as SpringApiResponse<unknown>;
      const stats = unwrapData(body);
      res.status(springRes.status).json(stats ?? body);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/hotels', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/admin/hotels`, { headers: getAuthHeaders(req) });
      const body = (await springRes.json()) as SpringApiResponse<unknown[]>;
      res.status(springRes.status).json({ hotels: ensureArray(unwrapData(body)) });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/hotels', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/admin/hotels`, {
        method: 'POST',
        headers: getAuthHeaders(req),
        body: JSON.stringify(mapAdminHotelPayload(req.body)),
      });
      const body = (await springRes.json()) as SpringApiResponse<unknown>;
      res.status(springRes.status).json({ hotel: unwrapData(body), error: body.message });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/admin/hotels/:id', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/admin/hotels/${req.params.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(req),
        body: JSON.stringify(mapAdminHotelPayload(req.body)),
      });
      const body = (await springRes.json()) as SpringApiResponse<unknown>;
      res.status(springRes.status).json({ hotel: unwrapData(body), error: body.message });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/hotels/:id', async (req, res, next) => {
    try {
      const permanent = req.query.permanent === 'true';
      const springRes = await fetch(
        `${SPRING_BASE}/api/admin/hotels/${req.params.id}?permanent=${permanent}`,
        { method: 'DELETE', headers: getAuthHeaders(req) }
      );
      const body = await springRes.json();
      res.status(springRes.status).json(body.data ?? body);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/bookings', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/admin/bookings`, { headers: getAuthHeaders(req) });
      const body = (await springRes.json()) as SpringApiResponse<unknown[]>;
      res.status(springRes.status).json({ bookings: ensureArray(unwrapData(body)) });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/admin/bookings/:id/status', async (req, res, next) => {
    try {
      const status = mapBookingStatus(req.body.status);
      const springRes = await fetch(`${SPRING_BASE}/api/admin/bookings/${req.params.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(req),
        body: JSON.stringify({ status }),
      });
      const body = (await springRes.json()) as SpringApiResponse<unknown>;
      res.status(springRes.status).json({ booking: unwrapData(body), error: body.message });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/users', async (req, res, next) => {
    try {
      const springRes = await fetch(`${SPRING_BASE}/api/admin/users`, { headers: getAuthHeaders(req) });
      const body = (await springRes.json()) as SpringApiResponse<unknown[]>;
      res.status(springRes.status).json({ users: ensureArray(unwrapData(body)) });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/admin/users/:id/status', async (req, res, next) => {
    try {
      await proxyToSpring(req, res, `/api/admin/users/${req.params.id}/status`, {
        method: 'PATCH',
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/admin/users/:id/role', async (req, res, next) => {
    try {
      await proxyToSpring(req, res, `/api/admin/users/${req.params.id}/role`, {
        method: 'PATCH',
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/users/:id', async (req, res, next) => {
    try {
      await proxyToSpring(req, res, `/api/admin/users/${req.params.id}`, { method: 'DELETE' });
    } catch (err) {
      next(err);
    }
  });

  // Offline booking - proxy as regular booking
  app.post('/api/admin/bookings/offline', async (req, res, next) => {
    try {
      const payload = {
        userId: 1,
        hotelId: Number(req.body.hotelId),
        roomId: req.body.roomId ? Number(req.body.roomId) : null,
        checkInDate: req.body.checkIn,
        checkOutDate: req.body.checkOut,
        guests: Number(req.body.guests),
      };
      const springRes = await fetch(`${SPRING_BASE}/api/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(req),
        body: JSON.stringify(payload),
      });
      const body = (await springRes.json()) as SpringApiResponse<unknown>;
      res.status(springRes.status).json({ booking: unwrapData(body), error: body.message });
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/admin/bookings/:id/reschedule', async (req, res, next) => {
    res.status(501).json({ error: 'Reschedule is not yet supported on the backend.' });
  });

  // ---- LOCAL DIAGNOSTICS (JSON file DB) ----
  app.get('/api/logs', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ logs: Database.getLogs() });
  });

  app.get('/api/emails', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    const recipient = req.query.recipient as string;
    const emails = recipient ? Database.getEmailsByRecipient(recipient) : Database.getPublicEmails();
    res.status(200).json({ emails });
  });

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Internal server error';
    logSystemAction('error', 'system', null, message);
    res.status(500).json({ error: message });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StayVibe] Server running at http://localhost:${PORT} (Spring: ${SPRING_BASE})`);
  });
}

function mapAdminHotelPayload(body: Record<string, unknown>) {
  const images: string[] = [];
  if (body.imageUrl) images.push(String(body.imageUrl));
  if (Array.isArray(body.images)) images.push(...(body.images as string[]));

  return {
    name: body.name,
    description: body.description || '',
    city: body.city,
    address: body.address || body.city,
    rating: Number(body.rating ?? (Number(body.stars ?? 3) * 2)),
    amenities: body.amenities || [],
    images: images.length ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    pricePerNight: Number(body.pricePerNight ?? 150),
    available: body.status !== 'disabled',
  };
}

function mapBookingStatus(status: string): string {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'pending') return 'confirmed';
  return 'confirmed';
}

startServer().catch((error) => {
  console.error('Fatal Server Boot Error:', error);
});
