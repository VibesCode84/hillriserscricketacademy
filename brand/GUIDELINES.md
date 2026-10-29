# HillRisers Brand Pack

This pack contains the current HillRisers logo direction and instructions for implementation in Claude Code or any web/app project.

## Core identity

The HillRisers identity should feel:

- Modern
- Premium
- Local to Harrow
- Sport-led without looking like a traditional sports club crest
- Suitable for websites, social media, print, kit and embroidery

The visual idea is based on:

- A simplified interpretation of the spire of St Mary's Church, Harrow on the Hill
- Rolling hill lines
- A shield/crest silhouette
- The HillRisers wordmark

Do not add:
- Crosses
- Castle/tower buildings
- Religious symbolism
- Extra landscape elements
- Decorative clutter
- Unnecessary gradients in production vector artwork

## Primary colours

Use these as the production palette:

- Deep Navy: #071B3F
- Rich Navy: #0A2A5E
- Warm Gold: #E8B84E
- Ivory: #F5F0E6

For digital interfaces, white may also be used where needed.

## Primary logo

Use:

`assets/hillrisers-primary-crest.png`

This is the preferred badge/crest identity.

It contains:
- Shield
- Simplified spire
- Rolling hill lines
- Full wordmark: HillRisers

Best for:
- Kit badges
- Embroidery
- Social profile images
- App icons
- Favicons
- Small brand marks
- Printed signage

## Horizontal logo

Use:

`assets/hillrisers-horizontal-logo.png`

Best for:
- Website headers
- Email signatures
- Documents
- Wide banners
- Navigation bars
- Sponsorship strips

## Variants reference

Use:

`assets/hillrisers-variants-sheet.png`

This is a visual reference sheet showing suggested variants and applications.

Do not treat every visual shown on that sheet as a final production asset.
It is a guide for building production-ready SVG versions.

## Required production variants

Claude Code should create or support the following:

1. Primary crest
   - Shield + spire + hills + HillRisers

2. Horizontal lockup
   - Crest on the left
   - HillRisers wordmark on the right

3. Icon only
   - Shield + spire + hills
   - No text

4. Wordmark only
   - HillRisers
   - No crest

5. Monochrome light
   - Ivory/white artwork
   - For dark backgrounds

6. Monochrome dark
   - Navy artwork
   - For light backgrounds

7. Embroidery version
   - Simplified
   - Thicker outlines
   - Reduced internal detail
   - No gradients
   - Avoid lines too thin to stitch cleanly

8. Favicon/app icon
   - Simplified shield/spire/hill mark
   - No wordmark

## Embroidery guidance

For embroidered badges:

- Use flat colours only
- Use a maximum of 3 thread colours:
  - Navy
  - Gold
  - Ivory
- Avoid gradients
- Avoid glow effects
- Avoid thin outlines
- Use thicker hill and shield lines
- Keep the spire simple and bold
- Keep "HillRisers" large enough to stitch legibly
- If the badge is smaller than roughly 60 mm wide, consider using the icon-only version

## Website usage

For the HillRisers website:

### Header
Preferred:
- Horizontal logo

### Mobile header
Preferred:
- Icon-only crest

### Favicon
Preferred:
- Icon-only crest

### Footer
Preferred:
- Horizontal logo or wordmark only

### Hero sections
Preferred:
- Primary crest or horizontal logo depending on space

## Spacing

Maintain clear space around the logo equal to at least:
- 25% of the crest width around the primary crest
- The height of the capital H around the horizontal lockup

Do not crowd the logo against:
- Edges
- Buttons
- Text
- Photography
- Other partner logos

## Backgrounds

Preferred:
- Deep navy
- White
- Ivory

Avoid:
- Busy photography directly behind the logo
- Low contrast backgrounds
- Strongly saturated colours that clash with gold

## Typography

The existing wordmark uses an elegant serif style.

For website body and UI text, pair the logo with a clean modern sans serif.

Recommended type directions:
- Inter
- Manrope
- DM Sans
- Plus Jakarta Sans

For editorial headings, a refined serif can also be used.

## Claude Code implementation instruction

Treat the supplied logo images as visual references.

For production web use:
- Recreate clean SVG assets where practical
- Preserve the overall proportions and composition
- Do not redesign the logo without explicit instruction
- Do not alter the spire into a church tower
- Do not add a cross
- Do not add buildings
- Do not add decorative scenery
- Keep the hills simple and modern
- Keep the full name exactly: HillRisers

The primary logo should visually communicate:
Harrow on the Hill + progression + sport + opportunity.

## File list

- `hillrisers-primary-crest.png`
- `hillrisers-horizontal-logo.png`
- `hillrisers-variants-sheet.png`
- `hillrisers-crest-source.png`

## Suggested folder structure in a web project

```text
/public/brand/
  hillrisers-primary-crest.png
  hillrisers-horizontal-logo.png
  hillrisers-icon.svg
  hillrisers-horizontal.svg
  hillrisers-wordmark.svg
  hillrisers-mono-light.svg
  hillrisers-mono-dark.svg
  favicon.svg
```

## Brand rule

When in doubt:

Keep it simple, premium, navy-and-gold, and recognisably HillRisers.