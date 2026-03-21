import '@angular/compiler';
import { HttpHandler, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Technique tag: TC-CC (Condition Coverage)
describe('JwtInterceptor (white-box condition coverage)', () => {
  let interceptor: JwtInterceptor;
  let next: HttpHandler;

  const authServiceMock = {
    getToken: vi.fn(),
  };

  beforeEach(() => {
    // Each test starts from a clean interceptor and handler call history.
    vi.clearAllMocks();
    interceptor = new JwtInterceptor(authServiceMock as unknown as AuthService);
    next = {
      handle: vi.fn().mockReturnValue(of({})),
    };
  });

  it('adds Authorization header when token exists', () => {
    // TC-CC-01: token condition = true
    // Condition true: token exists, header must be attached.
    authServiceMock.getToken.mockReturnValue('abc.def.ghi');
    const req = new HttpRequest('GET', '/api/meetings');

    interceptor.intercept(req, next).subscribe();

    const interceptedReq = (next.handle as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(interceptedReq.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
  });

  it('does not add Authorization header when token is missing', () => {
    // TC-CC-02: token condition = false
    // Condition false: no token, request should pass through unchanged.
    authServiceMock.getToken.mockReturnValue(null);
    const req = new HttpRequest('GET', '/api/meetings');

    interceptor.intercept(req, next).subscribe();

    const interceptedReq = (next.handle as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(interceptedReq.headers.has('Authorization')).toBe(false);
  });
});
