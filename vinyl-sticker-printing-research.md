# Vinyl Sticker Printing Research for Circular Calendar

## Current Setup
- 24 curved arc strips (12 solar + 12 Islamic months) printed across 3 letter-sized pages
- Each arc is a pre-curved annular segment (~0.8" radial thickness)
- Assembled into a ~2–3 ft diameter circle on the wall
- Printed on regular paper via inkjet printers

## Goal
Find services that can print the arcs as **pre-cut vinyl wall stickers**, eliminating manual cutting and improving durability.

---

## Option 1: Online Custom Wall Decal Services (Recommended)

These services accept uploaded artwork (SVG/PDF), print full-color on vinyl, and die-cut/contour-cut to the exact shape of your design.

### Best Fits

| Service | Why It Fits | Sizes | File Types | Notes |
|---------|------------|-------|------------|-------|
| [**Sticker Mule**](https://www.stickermule.com/products/wall-graphics) | Wall-specific product, 4-day turnaround, free shipping | Custom | Most formats | Removable fabric adhesive, won't damage walls. Free proof before printing. |
| [**StickyLife**](https://www.stickylife.com/wall-decals) | Cut-to-shape wall decals, no minimums | Custom | SVG, PDF, PNG, JPG | If they can't cut to shape, they print on clear vinyl and contour cut within 1/8". |
| [**Wall Decal World**](https://www.walldecalworld.com/product/custom-wall-decals/custom-die-cut-wall-decal) | Specializes in wall decals, sizes 1–8+ ft | 1 ft – 8 ft+ | SVG, AI, EPS, PDF, PNG | Free proof, full refund before approval. Ships in 4–5 business days. |
| [**Signs.com**](https://www.signs.com/custom-decals/) | Custom contour-cut, strong design tool | Custom | SVG, AI, EPS, PDF, PNG | Cut to exact shape, no background. Reusable option available. |
| [**Printmoz**](https://www.printmoz.com/wall-decals) | Budget option at ~$5.49/sq ft | Custom | Most formats | Exact cut (die cut) with transfer tape. Premium 3.4 mil vinyl. |
| [**Printastic**](https://www.printastic.com/large-format-decals/) | Premium 3M vinyl, 10-year durability | Custom | Most formats | Contour cut into any complex shape. Best for long-term use. |

### Other Options

| Service | Notes |
|---------|-------|
| [**Want Stickers**](https://wantstickers.com/print/transfer-vinyl-wall-decals/) | Transfer vinyl decals, cut directly to design, no background. Good for clean arc look. |
| [**Cardboard Cutout Standees**](https://www.cardboardcutoutstandees.com/custom-wall-decals.html) | Next business day shipping, die-cut to exact shape. |
| [**48HourPrint**](https://www.48hourprint.com/die-cut-stickers.html) | Has a standard **arch shape** option that may match arc segments. |
| [**StickerApp**](https://stickerapp.com/materials/vinyl-stickers) | Die-cut any shape, matte or glossy, UV protected 4+ years. |
| [**Same Day Rush Printing**](https://www.samedayrushprinting.com/wide-format-and-signs/oversize-decals-stickers/) | Same-day/next-day turnaround for urgent orders. |
| [**BannerBuzz**](https://www.bannerbuzz.com/die-cut-decals/p) | Die-cut decals, up to 30% off bulk. |

---

## Option 2: DIY with Cricut/Silhouette (Print Then Cut)

If you want to produce multiple copies or iterate quickly, a home cutting machine can print on vinyl sticker paper and then cut the arc shapes automatically.

### How It Works
1. Print arcs on **printable vinyl sticker paper** using a regular inkjet printer
2. Feed the printed sheet into a Cricut/Silhouette machine
3. The machine reads registration marks and cuts each arc to shape

### Machines
- **Cricut Explore Air 3 / Maker** – Best for Print Then Cut
- **Silhouette Cameo 4** – More reliable print-then-cut alignment

### Cricut Print Then Cut Limits
- **Max printable area: 6.75" × 9.25"** per sheet
- Mat size: 12" × 12" (or 12" × 24")
- Registration marks consume ~0.75" on each side

### Materials
- Printable vinyl sticker paper (waterproof options: Royal Elements, Orajet, Starcraft)
- Transfer tape for application
- Laminate sheets for durability (optional)

---

## Computed Arc Dimensions & Cricut Layouts

Run `python cricut_layout.py` for full details. Summary below.

### Arc Dimensions by Scale Factor

Each arc is a curved annular segment (banana-shaped). The **bounding box** is wider than the arc itself due to curvature.

#### Scale 0.7 (default) — 21.4" / 1.8 ft circle

| Arc Type | Days | Bounding Box | Radial Thickness | Fits Cricut PTC? |
|----------|------|-------------|------------------|-----------------|
| Solar 31-day (Jan,Mar,May,Jul,Aug,Oct,Dec) | 31 | **5.63" × 1.20"** | 0.86" | Yes |
| Solar 30-day (Apr,Jun,Sep,Nov) | 30 | **5.45" × 1.18"** | 0.86" | Yes |
| Solar 29-day (Feb) | 29 | **5.27" × 1.16"** | 0.86" | Yes |
| Islamic 30-day (all) | 30 | **5.01" × 1.15"** | 0.86" | Yes |

#### Scale 0.785 — 24" / 2.0 ft circle

| Arc Type | Days | Bounding Box | Radial Thickness | Fits Cricut PTC? |
|----------|------|-------------|------------------|-----------------|
| Solar 31-day | 31 | **6.31" × 1.35"** | 0.96" | Yes (0.44" margin) |
| Solar 30-day | 30 | **6.11" × 1.32"** | 0.96" | Yes |
| Solar 29-day (Feb) | 29 | **5.91" × 1.30"** | 0.96" | Yes |
| Islamic 30-day | 30 | **5.62" × 1.29"** | 0.96" | Yes |

#### Scale 0.98 — 30" / 2.5 ft circle

| Arc Type | Days | Bounding Box | Radial Thickness | Fits Cricut PTC? |
|----------|------|-------------|------------------|-----------------|
| Solar 31-day | 31 | **7.89" × 1.69"** | 1.20" | **NO** (1.14" too wide) |
| Solar 30-day | 30 | **7.64" × 1.66"** | 1.20" | **NO** |
| Islamic 30-day | 30 | **7.03" × 1.62"** | 1.20" | **NO** |

**Maximum circle diameter for Cricut Print Then Cut: ~25.7" (2.1 ft)** at scale 0.84.

For circles larger than 2.1 ft, you must either:
1. Split each arc into 2 half-arcs
2. Use the Cricut for cutting only (print on a separate wide-format printer)
3. Use an online service instead

### Optimal Cricut Sheet Layouts

#### Default Scale 0.7 (21" circle) — Best option: **3 sheets** (nested layout)

Alternating arc orientation lets curves nest together, saving ~25% vertical space:

```
Sheet 1 (8 arcs):  Jan, Feb↕, Mar, Apr↕, May, Jun↕, Jul, Aug↕
Sheet 2 (8 arcs):  Sep, Oct↕, Nov, Dec↕, Muharram, Safar↕, Rabi I, Rabi II↕
Sheet 3 (8 arcs):  Jumada I, Jumada II↕, Rajab, Sha'baan↕, Ramadan, Shawwal↕, Dhu al-Qa'dah, Dhu al-Hijja↕
```
(↕ = flipped orientation for nesting)

Simple stacking (no nesting): **4 sheets** (7+7+7+3 arcs).

#### 2 ft circle (scale 0.785) — **4 sheets** either way

Arcs are larger so nesting saves less. Simple stacking: 6+6+6+6 = 4 sheets.

### Cost per Set (Cricut DIY)

| Item | Qty | Cost |
|------|-----|------|
| Printable vinyl sheets (letter size) | 3–4 | ~$4.50–$6.00 |
| Transfer tape | 3–4 sheets | ~$1.50–$2.00 |
| **Total per calendar** | | **~$6–$8** |

(Machine cost: Cricut Maker ~$300, Cricut Explore Air 3 ~$200, amortized over many prints)

---

## Option 3: Local Sign/Print Shops

Most local sign shops have wide-format printers and vinyl cutters. They can:
- Print your PDF/SVG on adhesive vinyl
- Contour-cut each arc to shape
- Apply transfer tape for easy wall application

**Pros**: You can discuss the project in person, see material samples, fast local turnaround.
**Cons**: Pricing varies widely. Expect $8–$15/sq ft for print + contour cut.

Search for "custom vinyl decal printing" or "sign shop" in your area.

---

## Estimated Costs (24 arc pieces, ~2–3 ft assembled circle)

Each arc is roughly 5–8" long × 1" wide. Total vinyl area for all 24 arcs is small — roughly 1–2 sq ft total.

| Approach | Est. Cost for 1 Set (24 arcs) | Notes |
|----------|-------------------------------|-------|
| **Budget online service** (Printmoz) | ~$15–$30 | Depends on how you order (individual pieces vs. sheet) |
| **Mid-range online** (StickyLife, Signs.com) | ~$30–$60 | Per-piece pricing, contour cut |
| **Premium online** (Sticker Mule, Printastic) | ~$40–$80 | Higher quality vinyl, better adhesive |
| **Wall Decal World** (single large decal) | ~$25–$50 | Could print entire circle as one decal |
| **Cricut/Silhouette DIY** | ~$5–$10/set (after machine cost) | Ongoing cost is just vinyl sheets |
| **Local sign shop** | ~$30–$75 | Varies by location |

> **Note**: Ordering each of 24 arcs as individual stickers will cost more than ordering a few sheets with multiple arcs per sheet. Most services charge per piece, so batching arcs onto fewer designs is more economical.

---

## Recommended Approach

### For simplicity (order and done):
1. **Export each page of arcs as a high-res PDF/PNG** (the 3 calendar pages you already generate)
2. **Upload to [StickyLife](https://www.stickylife.com/wall-decals) or [Signs.com](https://www.signs.com/custom-decals/)** as 3 separate wall decals
3. **Select contour/die-cut** so each arc is individually cut on the sheet
4. Apply to wall using included transfer tape

### For best wall decal experience:
- **[Sticker Mule Wall Graphics](https://www.stickermule.com/products/wall-graphics)** — removable, won't damage walls, free proof, fast turnaround

### For whole-circle approach:
- Modify the code to output the **full assembled circle as a single large SVG/PDF**
- Order as one 2–3 ft wall decal from **[Wall Decal World](https://www.walldecalworld.com/product/custom-wall-decals/custom-die-cut-wall-decal)** or **[Printastic](https://www.printastic.com/large-format-decals/)**
- Eliminates assembly entirely

### For recurring/bulk production:
- Invest in a **Cricut Maker** (~$300) + printable vinyl
- Ongoing cost per calendar drops to ~$5–$10 in materials
- Full control over iteration and reprints

---

## File Format Recommendations

For best results with any vinyl printing service:
- **Vector formats preferred**: SVG, AI, EPS (infinitely scalable, clean cuts)
- Your project already generates SVG as an intermediate format — this is ideal
- Export at the final desired size (2–3 ft diameter)
- For raster uploads: 300 DPI minimum at final print size
- Ensure all text is converted to outlines/paths (your SVG already does this)

## Code Changes Needed

To support vinyl printing, consider:
1. **Add a "full circle" SVG export mode** — outputs the assembled circle as a single file instead of linear strips across multiple pages
2. **Add bleed/margin** for contour cutting (~1/16" to 1/8")
3. **Export individual arc SVGs** — one file per month for per-piece ordering
4. **Scale factor adjustment** — ensure output matches desired 2–3 ft final diameter
