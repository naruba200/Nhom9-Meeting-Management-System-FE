import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'homepage',
    renderMode: RenderMode.Client
  },
  {
    path: 'meeting',
    renderMode: RenderMode.Client
  },
  {
    path: 'calendar',
    renderMode: RenderMode.Client
  },
  {
    path: 'profile',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
