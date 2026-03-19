---
trigger: always_on
---

# Spendly Brand Guidelines

## Brand Name
**Spendly**
Always written with a capital S. Never written as "spendly" 
or "SPENDLY" unless in all-caps contexts.

### Acceptable Usage
- Spendly
- SPENDLY (all caps only in display/hero contexts)

### Unacceptable Usage
- spendly (all lowercase)
- SpendLy (mixed case)
- Spendly. (with period, except in logo lockup)

---

## Logo Mark
- Symbol: Purple asterisk (*) icon — use Lucide "Asterisk" icon
- Wordmark: "Spendly" in Plus Jakarta Sans Bold
- Symbol color: #6A42E3 (purple)
- Wordmark color: #FFFFFF (white)
- Always display symbol to the LEFT of the wordmark
- Minimum digital size: 120px width
- Clear space: equal to height of "S" on all sides

### Logo Don'ts
- Do not change the asterisk color to anything other than #6A42E3
- Do not use the wordmark without the asterisk symbol
- Do not place logo on light or white backgrounds
- Do not stretch, rotate, or add effects to the logo

---

## Color Palette

### Primary Colors

**Spendly Purple (Primary Action)**
- HEX: #6A42E3
- Use as: Primary buttons, active nav, FAB button, 
  highlights, focus rings, key accents

**Spendly Cyan (Income / Positive)**
- HEX: #42E3D0
- Use as: Income amounts, positive values, 
  secondary accents, chart income bars

### Background Colors

**Deep Navy (App Background)**
- HEX: #091428
- Use as: Main app background on ALL pages
  Never use white or light backgrounds

**Dark Surface (Cards)**
- HEX: #1A1A23
- Use as: Card backgrounds, input fields, 
  modal surfaces, bottom sheet

**Glass Surface (Glassmorphism Cards)**
- Background: rgba(255, 255, 255, 0.04)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Backdrop filter: blur(12px)
- Use as: Floating cards, bottom nav, modals

### Semantic Colors

**Expense Red**
- HEX: #F86161
- Use as: Expense amounts, negative values, 
  over-budget states, error states

**Warning Yellow**
- HEX: #E7BE29
- Use as: 80% budget warning, pending states

**Success Green (alternate positive)**
- HEX: #42E3D0
- Same as Spendly Cyan

### Text Colors

**Text Primary**
- HEX: #FFFFFF
- Use as: All headings, amounts, primary labels

**Text Muted**
- HEX: #6B7280
- Use as: Dates, secondary labels, placeholders, 
  helper text

**Text Disabled**
- HEX: #374151
- Use as: Disabled inputs, inactive states

### Border Colors
**Subtle Border**
- rgba(255, 255, 255, 0.08)
- Use as: Card borders, dividers, input borders

**Focus Border**
- #6A42E3
- Use as: Active input focus ring

---

## Typography

### Primary Font
**Plus Jakarta Sans** (Google Fonts)
Import URL: https://fonts.google.com/specimen/Plus+Jakarta+Sans
Fallbacks: Inter, system-ui, sans-serif

### Font Weights
- ExtraBold (800): Financial amounts, hero numbers
- Bold (700): Page headings, card titles
- SemiBold (600): Section labels, button text
- Medium (500): Subheadings, nav labels
- Regular (400): Body text, descriptions
- Light (300): Captions only (use sparingly)

### Font Sizes (Mobile-first)
- Hero Amount: 32px / 2rem (e.g. total balance)
- H1: 24px / 1.5rem
- H2: 20px / 1.25rem
- H3: 16px / 1rem (semibold)
- Body: 14px / 0.875rem
- Small: 12px / 0.75rem
- Caption: 11px / 0.6875rem

### Number Display Rule
All financial amounts MUST use:
- Font weight: 800 (ExtraBold)
- ₹ prefix before every amount
- Income amounts: color #42E3D0
- Expense amounts: color #F86161
- Neutral/balance amounts: color #FFFFFF

---

## UI Component Rules

### Cards
- Background: rgba(255, 255, 255, 0.04)
- Border: 1px solid rgba(255, 255, 255, 0.08)
- Border radius: 20px (large cards), 16px (small cards)
- Backdrop filter: blur(12px)
- Padding: 20px
- No hard shadows — use glow effects instead

### Buttons

**Primary Button (e.g. Save, Login, Add)**
- Background: #6A42E3
- Text: #FFFFFF, SemiBold
- Border radius: 9999px (fully rounded)
- Padding: 14px 24px
- Hover/Active: brightness 1.1, subtle purple glow
- Width: full width on mobile modals

**Secondary Button (e.g. Cancel, See all)**
- Background: transparent
- Border: 1px solid rgba(255,255,255,0.15)
- Text: #FFFFFF, Medium
- Border radius: 9999px
- Hover: rgba(255,255,255,0.05) background

**Danger Button (e.g. Delete)**
- Background: rgba(248, 97, 97, 0.15)
- Border: 1px solid #F86161
- Text: #F86161
- Border radius: 9999px

**FAB Button (Floating Action)**
- Background: #6A42E3
- Icon: white "+" (Plus icon, Lucide)
- Size: 56px x 56px circle
- Position: fixed, above bottom nav, center
- Shadow: 0 0 20px rgba(106, 66, 227, 0.5)

### Input Fields
- Background: #1A1A23
- Border: 1px solid rgba(255,255,255,0.08)
- Border radius: 12px
- Text: #FFFFFF
- Placeholder: #6B7280
- Focus border: #6A42E3
- Focus glow: 0 0 0 3px rgba(106,66,227,0.2)
- Padding: 14px 16px
- Font size: 14px

### Bottom Navigation Bar
- Background: rgba(26, 26, 35, 0.85)
- Border top: 1px solid rgba(255,255,255,0.08)
- Backdrop filter: blur(20px)
- Position: fixed bottom 0
- Height: 64px + safe area inset
- Active tab icon: #6A42E3
- Inactive tab icon: #6B7280
- Active tab label: #6A42E3, 10px
- Inactive tab label: #6B7280, 10px

### Bottom Sheet Modal
- Background: #1A1A23
- Border radius: 24px 24px 0 0 (top corners only)
- Border top: 1px solid rgba(255,255,255,0.08)
- Handle bar: 40px wide, 4px tall, #374151, 
  centered at top, margin-top 12px
- Backdrop: rgba(0,0,0,0.6)
- Animation: slides up from bottom (300ms ease-out)

### Segmented Control (Toggle)
- Container background: #1A1A23
- Border radius: 9999px
- Active segment: #6A42E3, white text
- Inactive segment: transparent, muted text
- Transition: 200ms ease

### Progress Bars (Budget)
- Track background: rgba(255,255,255,0.08)
- Border radius: 9999px
- Height: 8px
- Fill colors:
  Under 80%:  #42E3D0 (cyan)
  At 80-99%:  #E7BE29 (yellow)
  At 100%+:   #F86161 (red)

### Category Icon Circles
- Size: 40px x 40px
- Border radius: 12px
- Background: category color at 15% opacity
- Icon: category color at 100%, 20px size

### Status Badges
- Border radius: 9999px
- Padding: 4px 10px
- Font size: 11px, SemiBold

---

## Iconography
- Library: Lucide React (ONLY)
- Style: Outline (default Lucide style)
- Standard size: 20px
- Small size: 16px
- Large size: 24px
- Color: Match context (white, purple, cyan, red)
- Never use filled/solid icons unless for FAB

---

## Motion & Animation

### Principles
- Subtle and purposeful — never decorative only
- Duration: 150ms–300ms maximum
- Easing: ease-out for entrances, ease-in for exits

### Standard Animations
- Page transition: fade in (200ms ease-out)
- Bottom sheet open: slide up (300ms ease-out)
- Bottom sheet close: slide down (250ms ease-in)
- Cards on load: fade + slight translateY up (200ms)
- Button press: scale 0.97 (100ms)
- FAB button: scale pulse on mount (once)

---

## Spacing System
- Base unit: 4px
- xs:  4px
- sm:  8px
- md:  16px
- lg:  24px
- xl:  32px
- 2xl: 48px
- Page horizontal padding: 20px (mobile)
- Section gap: 24px
- Card inner padding: 20px

---

## Tone of Voice
- **Friendly:** Talks like a smart friend, not a bank
- **Clear:** No financial jargon, plain language
- **Motivating:** Positive framing around money habits
- **Concise:** Short labels, no unnecessary words

### Microcopy Examples
- Empty states: "No transactions yet. Tap + to add one."
- Delete confirm: "Delete this transaction? This cannot be undone."
- Over budget: "You've exceeded your budget for this category."
- Success: "Transaction saved!"
- Error: "Something went wrong. Please try again."