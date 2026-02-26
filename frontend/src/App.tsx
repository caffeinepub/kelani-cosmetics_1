import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './router';
import { ToastViewport } from './components/toast/ToastViewport';

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  scrollRestorationBehavior: 'instant',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastViewport />
    </>
  );
}
