# Design System & Artistic Direction
**Inspiration:** Clair Obscur - Expedition 33
**Key Themes:** Belle Époque, Art Nouveau, Chiaroscuro, Dark Romanticism, Canvas & Paint, Macabre Elegance.

---

## 1. Design Philosophy (The Concept)
The design must evoke a world that is beautiful yet doomed, frozen in time. Contrast is the guiding principle: light must pierce through darkness. The interface should feel both luxurious (gold leaf, serif fonts) and textured (paint grain, aged paper), avoiding sterile "flat design" in favor of dramatic depth.

---

## 2. Design Tokens (CSS Variables)

### Color Palette (The Dark Academia & Brushstroke Palette)
* `--bg-ink`: `#0A0B0E` (Primary background, total darkness)
* `--bg-slate`: `#15171A` (Secondary backgrounds, cards, modals)
* `--bg-prussian`: `#0D161F` (Tertiary backgrounds, cold variations)
* `--text-parchment`: `#E6E1D6` (Primary text, soft on the eyes)
* `--text-ash`: `#9BA3AD` (Secondary text, metadata, descriptions)
* `--accent-gold`: `#C5A059` (Tarnished Gold: primary interactions, headings)
* `--accent-blood`: `#782827` (Dried Blood: errors, alerts, destructive states)
* `--accent-magic`: `#5B8FB9` (Ethereal Blue: focus, magic, success states)
* `--border-dim`: `rgba(197, 160, 89, 0.2)` (Subtle gold borders)

### Typography
* `--font-heading`: 'Cormorant Garamond', 'Playfair Display', serif (High contrast, elegant serifs)
* `--font-body`: 'Lora', 'EB Garamond', serif (Reading comfort)
* `--font-sans`: 'Lato', 'Inter', sans-serif (Technical UI: tags, buttons, small labels)

---

## 3. Editorial Typography (Blog & Content-Heavy)

* **Drop Caps:** The first paragraph of a major article should feature a large drop cap, ideally stylized with Art Nouveau motifs or colored in `--accent-gold`.
* **Blockquotes:** * Background: Slightly lighter than the page (`--bg-slate`).
    * Border: Thick left border in `--accent-gold`.
    * Style: Italicized, increased size, serif font.
* **Separators (Hr):** Avoid simple lines. Use a typographic fleur-on (e.g., ❦) or a line that fades out using a gradient on both ends.

---

## 4. Universal UI Components

### Buttons
* **Primary Button:** * Background: Transparent or Ink Black.
    * Border: 1px solid Gold (`--accent-gold`).
    * Text: Gold, uppercase with wide letter-spacing (2px).
    * Hover: Golden outer glow (box-shadow) and smooth transition.
* **Secondary Button:** Subtly underlined text, no border.

### Forms & Inputs
* **Default Style:** No full border. Only a bottom border in `--text-ash`, resembling a line in an old notebook.
* **Focus State:** The bottom border glows in gold or magic blue with a soft "wet ink" glow effect.

### Modals & Dialogs
* **Overlay:** Deep black at 80% opacity with a slight backdrop blur.
* **Shadows:** Very large, soft, and pure black to make elements look like floating paintings.

---

## 5. Site-Specific Guidelines

### A. E-Commerce
* **Product Cards:** Frame products like paintings. Backgrounds should be dark or textured.
* **Badges (New / Sale):** Simple geometric shapes (diamonds or thin rectangles).
* **Pricing:** Always displayed in Serif font, color `--accent-gold`.

### B. Portfolio (Art & Photography)
* **Galleries:** Use tight grids with minimal gutters. 
* **Hover Effects:**
    * *Option 1:* Images start in dark B&W and gain color on hover (the artist bringing the work to life).
    * *Option 2:* A black ink overlay dissipates to reveal the full image.

### C. Showcase & Landing Pages
* **Hero Section:** Massive centered title. Heavy use of negative space. The background image/video should have a dark radial mask so the edges blend into the page's black (`#0A0B0E`).

---

## 6. Micro-interactions & "Chiaroscuro" Details

* **Cursor (Optional):** Replace the standard cursor with a small gold dot that leaves a brief, vaporous trail (like smoke or a fading brushstroke).
* **Scrollbar:** Custom-styled. Black track, thin dark grey thumb that turns gold on hover.
* **Animations:** Slow and fluid. Use `cubic-bezier(0.25, 0.46, 0.45, 0.94)`. Use "Fade-in and Slide-up" effects on scroll.