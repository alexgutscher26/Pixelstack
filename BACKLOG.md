# � The Ultimate Comprehensive Product Backlog

This backlog serves as the single source of truth for the XDesign AI product roadmap. It covers everything from critical hotfixes to long-term visionary features.

---

## � Phase 1: Critical Fixes & Stability (Immediate Priority)

### Authentication & Session Management

- [x] **Token Persistence**: Investigate and fix reported issues where Kinde auth tokens are lost on refresh.
- [x] **Session Expiry Handling**: Implement a graceful logout or "re-authenticate" modal when the session expires while working.
- [x] **Auth Error Boundaries**: Add specific error boundaries for the `/api/auth` routes to prevent white screens.
- [x] **Middleware Optimization**: Review `middleware.ts` to ensure protected routes are efficiently guarded without unnecessary redirects.
- [x] **Post-Login Redirection**: Ensure users are redirected back to the project they were viewing after logging in.

### Core Stability

- [x] **Canvas Crash Prevention**: Add a global ErrorBoundary around the `Canvas` component to catch rendering errors without crashing the app.
- [x] **Network Recovery**: Implement `react-query` retry logic with exponential backoff for poor network conditions.
- [x] **Image Loading Fallbacks**: Replace broken image links with a local placeholder if Unsplash/external assets fail to load.
- [x] **Database Connection Pooling**: Verify Prisma connection pooling settings to prevent timeout errors under load.

### UI Hotfixes

- [x] **Mobile Layout Blocker**: Add a "Please use Desktop" overlay for screens smaller than 768px (temporary fix until mobile support).
- [x] **Z-Index Wars**: Fix z-index issues where the dropdown menu gets hidden behind the canvas toolbar.
- [x] **Toast Overlap**: Ensure `Sonner` toasts do not overlap with critical action buttons.

---

## 💎 Phase 2: Core Experience Polish (Short Term)

### Dashboard Experience

- [x] **Project Search**: Add a search bar to filter projects by name.
- [x] **Project Thumbnails**: Generate and store actual screenshots of project canvases as thumbnails instead of generic icons.
- [x] **Empty State Illustration**: Add a high-quality SVG illustration for the "No Projects" state.
- [x] **Rename Project**: Add "Rename" option in the project dropdown menu.
- [x] **Delete Confirmation**: Add a "Type 'DELETE' to confirm" modal for project deletion to prevent accidents.

### Editor UI Improvements

- [x] **Toolbar Tooltips**: Add keyboard shortcut tooltips to all toolbar buttons (e.g., "Select (V)", "Hand (H)").
- [x] **Active State Indicators**: clearly highlight the currently active tool in the toolbar.
- [x] **Sidebar Resizing**: Allow the left sidebar (layers/settings) to be collapsible and resizable.
- [x] **Canvas Background**: Allow changing the canvas background color (dots, grid, solid colors).
- [x] **Zoom Level Indicator**: Display the current zoom percentage (e.g., "100%") in the UI.

### Feedback Systems

- [x] **Generation Progress Bar**: Replace the simple spinner with a multi-step progress bar (e.g., "Analyzing prompt..." -> "Generating Layout..." -> "Rendering...").
- [x] **Success Celebrations**: Add subtle confetti or sound effect (optional) when a generation completes successfully.
- [ ] **Feedback Widget**: Add a "Send Feedback" button in the help menu for users to report bugs directly. need to store in db

---

## 🤖 Phase 3: Advanced AI & Generation Capabilities

### Prompt Engineering & Control

- [x] **Prompt Enhancement**: Add a "Magic Enhance" button that rewrites simple prompts into detailed design specifications.
- [x] **Negative Prompts**: Allow users to specify what they _don't_ want (e.g., "no red", "no rounded corners").
- [x] **Design Style Presets**:
  - [x] Minimalist
  - [x] Brutalist
  - [x] Corporate / Enterprise
  - [x] Playful / Gamified
  - [x] Dark Mode Native
- [x] **Reference Image Upload**: Allow users to upload a screenshot and ask the AI to "copy this style".

### Specialized Generation Modes

- [ ] **Component Generator**: "Generate a pricing table", "Generate a navbar", "Generate a credit card form".
- [x] **Wireframe Mode**: Generate low-fidelity wireframes (black & white, blocky) before committing to high-fidelity.
- [ ] **Copywriting AI**: "Rewrite all text in this frame to be more professional".
- [ ] **Icon Generation**: Integrate an icon generation API to create custom SVG icons on the fly.

### Context Awareness

- [x] **Project-wide Context**: Pass the context of Frame 1 when generating Frame 2 (consistency in colors/fonts).
- [ ] **Brand Kit**: Allow users to define a "Brand Kit" (Logo, Primary Color, Font) that the AI must strictly follow.

---

## 🎨 Phase 4: Canvas & Editor Power Features

### Object Manipulation

- [x] **Multi-Select**: Allow selecting multiple elements (Shift+Click or Drag Select).
- [ ] **Group/Ungroup**: Group elements together to move them as a unit.
- [ ] **Alignment Tools**: "Align Left", "Align Center", "Distribute Vertically".
- [ ] **Layer Management**: A dedicated "Layers" panel to reorder elements (z-index control).
- [x] **Lock/Unlock**: Lock elements to prevent accidental edits.

### Manual Design Tools

- [ ] **Text Tool**: Click to add a text box manually.
- [ ] **Shape Tool**: Add Rectangles, Circles, Lines manually.
- [ ] **Image Upload**: Drag and drop images directly onto the canvas.
- [ ] **Icon Library**: Integrated search for Lucide/Phosphor icons to drag-and-drop.

### Device Frames

- [ ] **Dynamic Resizing**: Allow the device frame to be resized arbitrarily.
- [ ] **Device Presets**:
  - [ ] iPhone 15 Pro Max
  - [ ] iPhone SE
  - [ ] Pixel 8 Pro
  - [ ] Samsung Galaxy S24
  - [ ] iPad Pro 12.9"
  - [ ] iPad Mini
- [ ] **Orientation**: Toggle between Portrait and Landscape modes.

---

## � Phase 5: Project Management & Organization

### Folder System

- [ ] **Create Folders**: Group projects into folders (e.g., "Client Work", "Personal", "Archive").
- [ ] **Move Projects**: Drag and drop projects between folders.
- [ ] **Tags/Labels**: Add colored tags to projects for easy filtering.

### Version History

- [ ] **Auto-Save**: Ensure changes are saved automatically every few seconds.
- [ ] **Version Timeline**: View a timeline of changes.
- [ ] **Restore Version**: Revert the entire project to a state from 1 hour/1 day ago.
- [ ] **Snapshotting**: Manually create a "Named Version" (e.g., "V1 Final").

---

## 👥 Phase 6: Collaboration & Teams (Enterprise)

### Real-Time Collaboration

- [ ] **Live Cursors**: See where other team members are looking.
- [ ] **Component Locking**: Lock a component while someone else is editing it.
- [ ] **Presence Indicators**: Show avatars of currently active users in the header.

### Comments & Review

- [ ] **Comment Threads**: Click anywhere to leave a comment (Figma style).
- [ ] **Mention System**: @mention team members in comments to send email notifications.
- [ ] **Resolve Comments**: Mark threads as resolved to hide them.

### Team Management

- [ ] **Workspaces**: distinct workspaces for different companies/teams.
- [ ] **Role-Based Access Control (RBAC)**:
  - [ ] **Owner**: Full billing & delete rights.
  - [ ] **Admin**: Can invite/remove users.
  - [ ] **Editor**: Can edit projects.
  - [ ] **Viewer**: Read-only access.
- [ ] **Invite Links**: Generate time-limited invite links.

---

## 💰 Phase 7: Monetization & Billing

### Integration

- [ ] **Stripe Checkout**: Implement one-time payments or subscriptions.
- [ ] **Stripe Customer Portal**: Allow users to manage their subscription/invoices.
- [ ] **Webhook Handler**: Listen for `invoice.payment_failed`, `subscription.canceled`, etc.

### Pricing Models

- [ ] **Credit System**: 1 Credit = 1 AI Generation.
- [ ] **Top-up Packs**: "Buy 50 Credits for $10".
- [ ] **Freemium Limits**:
  - [ ] Free: 3 Projects, 10 Generations/mo.
  - [ ] Pro: Unlimited Projects, 500 Generations/mo.
- [ ] **Enterprise Plans**: Contact Sales for SSO and custom limits.

---

## 🧑‍� Phase 8: Developer Experience & Code Quality

### Testing

- [ ] **Unit Tests**:
  - [ ] Test utility functions (`lib/utils.ts`).
  - [ ] Test prompt generation logic (`lib/prompt.ts`).
- [ ] **Integration Tests**:
  - [ ] Test API routes (mocking the database).
  - [ ] Test Inngest function triggers.
- [ ] **E2E Tests (Playwright)**:
  - [ ] User Login Flow.
  - [ ] Create Project Flow.
  - [ ] Generate Frame Flow.
  - [ ] Delete Project Flow.

### Codebase Health

- [ ] **Strict TypeScript**: Enable `noImplicitAny` and fix all resulting errors.
- [ ] **Import Sorting**: Enforce import order via ESLint.
- [ ] **Dead Code Removal**: Scan for and remove unused components and exports.
- [ ] **Bundle Analysis**: Run `@next/bundle-analyzer` to identify large dependencies.
- [ ] **Logging**: Replace `console.log` with a structured logger (e.g., `pino`).

### Documentation

- [ ] **Contributing Guide**: Create `CONTRIBUTING.md` for new developers.
- [ ] **API Documentation**: Document internal API routes using Swagger/OpenAPI.
- [ ] **Storybook**: Set up Storybook for the UI component library.

---

## 🔒 Phase 9: Security, Compliance & Ops

### Security

- [ ] **Rate Limiting**: Implement `upstash/ratelimit` on API routes to prevent abuse.
- [ ] **Input Sanitization**: Ensure all user inputs (prompts, project names) are sanitized (Zod).
- [ ] **Content Moderation**: Check prompts against OpenAI's moderation API to prevent NSFW generation.
- [ ] **Dependency Audit**: Run `npm audit` and fix high-severity vulnerabilities.

### Compliance

- [ ] **GDPR Export**: "Download all my data" button.
- [ ] **Account Deletion**: "Delete my account" button (hard delete from DB).
- [ ] **Privacy Policy**: Create a dedicated page.
- [ ] **Terms of Service**: Create a dedicated page.
- [ ] **Cookie Consent**: Add a cookie banner if tracking is implemented.

### Ops / DevOps

- [ ] **Sentry Integration**: Catch frontend and backend errors in production.
- [ ] **PostHog Analytics**: Track user funnels (Sign up -> Generate).
- [ ] **Uptime Monitoring**: Set up BetterStack/UptimeRobot for the landing page.

---

## 🚀 Phase 10: Marketing & Growth

### SEO

- [ ] **Sitemap**: Generate `sitemap.xml` dynamically.
- [ ] **Robots.txt**: Configure crawling rules.
- [ ] **Meta Tags**: Optimize OpenGraph images and descriptions for Twitter/LinkedIn sharing.
- [ ] **Blog**: Add a `/blog` section (using MDX) for content marketing.

### Growth Features

- [ ] **Social Sharing**: "Share to Twitter" button with a generated preview image.
- [ ] **Referral Program**: "Invite a friend, get 10 free credits".
- [ ] **Public Gallery**: A "Community Showcase" of the best AI-generated designs.
- [ ] **Embeddable Player**: Allow users to embed their interactive prototype on their portfolio.

---

## 📱 Phase 11: Mobile & Cross-Platform

### Mobile Support

- [ ] **Responsive Dashboard**: Make the project list viewable on mobile.
- [ ] **Mobile Viewer**: Allow opening a "View Only" version of the design on a phone for previewing.

### Native Apps (Long Term)

- [ ] **React Native App**: Wrapper around the viewer.
- [ ] **iPad App**: Full editor optimized for touch/Apple Pencil.

---

## 📤 Phase 12: Export & Integration Options

### Code Export

- [ ] **HTML/CSS Zip**: Standard static export.
- [ ] **React + Tailwind**: Component-based export.
- [ ] **Flutter Code**: Dart code generation.
- [ ] **SwiftUI Code**: Swift code generation.

### Design Tool Integrations

- [ ] **Figma Plugin**: "Import from XDesign AI".
- [ ] **Copy to Clipboard**: Copy as SVG/PNG directly to clipboard.

---

## 🧹 Technical Debt & Refactoring Tasks

- [x] **Refactor `page.tsx`**: The main project page is likely too large. Split into `Canvas.tsx`, `Sidebar.tsx`, `Toolbar.tsx`.
- [x] **Optimize Inngest Functions**: Ensure functions are idempotent.
- [x] **Prisma Schema Review**: Check if `Project` and `Frame` relations need cascading deletes.
- [x] **Hardcoded Strings**: Move all UI strings to a `messages.json` or constant file for future i18n.
- [x] **Theme System**: Ensure the theme provider handles system preference changes correctly.

---

_This backlog is a living document. Add new items as they are discovered._
