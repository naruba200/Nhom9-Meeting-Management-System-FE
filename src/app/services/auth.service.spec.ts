import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AuthService (white-box statement and condition coverage)', () => {
  let service: AuthService;
  let postMock: ReturnType<typeof vi.fn>;

  const createStorageMock = () => {
    // In-memory localStorage replacement so tests stay deterministic in Node.
    const store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
    };
  };

  beforeEach(() => {
    // Mock only what this suite needs: HTTP post and browser storage.
    postMock = vi.fn().mockReturnValue(of({ token: 'x.y.z', email: 'user@example.com', fullName: 'User Name' }));
    const httpMock = {
      post: postMock,
      get: vi.fn(),
      put: vi.fn(),
    } as unknown as HttpClient;

    vi.stubGlobal('localStorage', createStorageMock());
    service = new AuthService(httpMock);
  });

  it('getToken returns null for empty and undefined-like tokens', () => {
    localStorage.setItem('authToken', '   ');
    expect(service.getToken()).toBeNull();

    localStorage.setItem('authToken', 'undefined');
    expect(service.getToken()).toBeNull();

    localStorage.setItem('authToken', 'null');
    expect(service.getToken()).toBeNull();
  });

  it('getUserInfo returns null when token is malformed', () => {
    localStorage.setItem('authToken', 'malformed-token');

    const userInfo = service.getUserInfo();

    expect(userInfo).toBeNull();
  });

  it('getToken returns trimmed token when value is valid', () => {
    localStorage.setItem('authToken', ' valid.jwt.token ');

    const token = service.getToken();

    expect(token).toBe('valid.jwt.token');
  });

  it('login sends POST request to auth endpoint', () => {
    service.login({ email: 'user@example.com', password: 'secret' }).subscribe();

    expect(postMock).toHaveBeenCalledWith('http://localhost:8080/api/auth/login', {
      email: 'user@example.com',
      password: 'secret',
    });
  });
});
