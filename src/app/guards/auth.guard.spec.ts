import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Technique tag: TC-BC (Branch Coverage)
describe('AuthGuard (white-box branch coverage)', () => {
  let guard: AuthGuard;

  const authServiceMock = {
    isLoggedIn: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks before each case so each branch is measured independently.
    vi.clearAllMocks();
    guard = new AuthGuard(authServiceMock as unknown as AuthService, routerMock as unknown as Router);
  });

  it('returns true when user is logged in', () => {
    // TC-BC-01: if branch
    // Branch 1: authenticated users can pass the guard.
    authServiceMock.isLoggedIn.mockReturnValue(true);

    const canActivate = guard.canActivate();

    expect(canActivate).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('returns false and redirects to /login when user is not logged in', () => {
    // TC-BC-02: else branch
    // Branch 2: unauthenticated users are redirected.
    authServiceMock.isLoggedIn.mockReturnValue(false);

    const canActivate = guard.canActivate();

    expect(canActivate).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
