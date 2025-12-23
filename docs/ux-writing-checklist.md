# UX Writing Checklist & Review Process

## Principles

- Clarity over cleverness; make the next action obvious
- Concise, scannable, and context-aware
- Consistent terminology, tone, and capitalization
- Inclusive and respectful language
- Accessible for assistive technologies
- Internationalization-ready and culturally neutral

## Checklist

- Audience and intent are explicit
- Uses active voice and present tense
- Avoids jargon, idioms, and metaphors
- Sentence case for UI labels and messages
- Verbs-first CTAs (e.g., “Save”, “Try Again”)
- One idea per sentence; short paragraphs
- Reads well out loud
- Terminology aligns with product glossary
- Error messages state cause, impact, and action
- Empty states teach and motivate
- Success messages confirm and guide next step
- Loading states set expectations when needed
- Tooltips and help text add clarity, not repetition
- Placeholders show examples, not instructions
- Numbers, dates, and units are standardized
- Avoids gendered language; uses people-first phrasing
- Avoids “please” and apologies unless appropriate
- Variables and placeholders are clearly bracketed (e.g., {fileName})
- No hard-coded line breaks; allow responsive wrapping
- Strings are externalized for translation

## Patterns

### Error

- Title: brief and specific
- Body: what happened, why, what to do next
- Action: single clear recovery path
- Example: “Upload failed. File exceeds 25 MB. Choose a smaller file.”

### Success

- Title: confirms outcome
- Body: optional next step
- Action: primary continuation
- Example: “Profile updated. View changes”

### Confirmation

- Prompt: states irreversible effect
- Body: consequence and alternative
- Actions: primary confirm, secondary cancel
- Example: “Delete project? You’ll remove all frames. You can export first.”

### Empty State

- Title: states value
- Body: what appears here and how to start
- Action: guided first step
- Example: “No screens yet. Generate your first layout.”

## Accessibility

- Labels and alt text describe purpose, not appearance only
- Avoids color-only meaning; includes text feedback
- Announces dynamic changes with clear messages
- Keyboard focus order preserves narrative
- Avoids overly long strings in critical controls

## Internationalization

- Avoids idioms and wordplay
- Keeps sentences short; avoids nested clauses
- Leaves room for longer translations
- Uses placeholders for dynamic content (e.g., {count})
- Date/time/number formatting via locale utilities

## Review Process

1. Draft
   - Author writes copy in context (UI, Figma, or PR)
   - Include purpose, audience, and intended action
   - Provide screenshots and states (default, error, empty, success)
2. Peer Review
   - UX writer/designer reviews against this checklist
   - Validate glossary terms and tone consistency
   - Check accessibility and i18n readiness
3. Stakeholder Sign‑off
   - Product owner signs off on intent and outcomes
   - Legal/compliance review when applicable
4. Implementation
   - Externalize strings; use placeholders for variables
   - Verify length constraints and responsive behavior
   - Add tests for key messages if applicable
5. QA
   - Validate in staging across states and locales
   - Check screen reader announcements and focus
   - Confirm analytics/events don’t leak sensitive content
6. Change Management
   - Update glossary and component documentation
   - Record rationale in PR description
   - Add to release notes when user-visible

## Templates

### Error Message Template

- Title: “{Action} failed”
- Body: “{Cause}. {Impact}. {Recovery}.”
- Action: “Try Again” or specific recovery

### Success Message Template

- Title: “{Action} completed”
- Body: optional next step
- Action: “Continue”

### Empty State Template

- Title: “{Thing} not found”
- Body: “{What appears here}. {How to start}.”
- Action: primary first step
