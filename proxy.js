import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Every authenticated app page is gated here, not just /dashboard — pages
// that also render a route-level loading.js (Phase 10) stream their shell
// before their own in-page redirect() can run, which would otherwise turn
// an unauthenticated visit into a 200 instead of a clean redirect. Each
// page still keeps its own auth()+redirect() as defense in depth.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/mastery(.*)',
  '/revision(.*)',
  '/recommendations(.*)',
  '/failures(.*)',
  '/concepts(.*)',
  '/doubt-solver(.*)',
  '/settings(.*)',
  '/analyze(.*)',
  '/problems(.*)',
  '/activity(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
