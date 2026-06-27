---
title: "Mastering CSS Border-Radius: Creating Organic Shapes and Blobs with the 8-Value Syntax"
description: "Go beyond simple rounded corners. Learn how the 8-value CSS border-radius syntax works and how to create fluid, organic blob shapes for modern web designs."
pubDate: 2026-06-27
author: "Webutilbox Team"
category: "CSS"
tags: ["CSS", "Web Design", "Frontend", "UI/UX"]
keywords: "css border radius generator, 8 value border radius, css blob generator, organic shapes css, advanced css"
coverImage: "https://webutilbox.com/assets/og/og-css-tools.svg"
relatedTool:
  name: "Border Radius Generator"
  href: "/border-radius-generator/"
  icon: "⬜"
---

When we first learn CSS, the `border-radius` property seems incredibly simple. We use it to round the corners of our cards (`border-radius: 8px`), make pill-shaped buttons (`border-radius: 9999px`), or turn square avatars into perfect circles (`border-radius: 50%`).

But did you know that `border-radius` is capable of creating fluid, organic, and completely asymmetrical "blob" shapes? 

In modern web design, these organic shapes are everywhere. They serve as abstract backgrounds, modern profile image frames, and eye-catching interactive components. Best of all, they don't require heavy SVG files or complex images—they can be created entirely in CSS using the **8-value `border-radius` syntax**.

In this guide, we'll explain how this advanced syntax works and give you a playground to create and copy your own custom shapes.

---

## The Secret: Elliptical Border Radius

To understand the 8-value syntax, we first need to understand how the browser renders rounded corners.

When you write `border-radius: 10px;`, you are telling the browser to draw a circle with a radius of `10px` in the corner of your element. The curve of the corner is a segment of that circle.

However, corners don't have to be circular. They can be **elliptical**. An ellipse has two radii:
1. A **horizontal radius** ($r_x$)
2. A **vertical radius** ($r_y$)

To specify an elliptical corner, you separate the horizontal and vertical values using a slash (`/`):

```css
/* border-radius: [horizontal] / [vertical]; */
border-radius: 50px / 30px;
```

In this case, the corner curves will have a horizontal radius of `50px` and a vertical radius of `30px`. If you apply this to all corners, you get a squashed, oval-like rectangle.

---

## Expanding to 8 Values

We can specify the horizontal and vertical radii for **each of the four corners independently**. This is where we get 8 distinct values. 

The syntax follows this order, with horizontal values first, then a slash, then vertical values:

```css
border-radius: [TL-h] [TR-h] [BR-h] [BL-h] / [TL-v] [TR-v] [BR-v] [BL-v];
```

* **Horizontal Group (before `/`)**: Top-Left, Top-Right, Bottom-Right, Bottom-Left
* **Vertical Group (after `/`)**: Top-Left, Top-Right, Bottom-Right, Bottom-Left

### Visualization
Think of it as two separate passes:
1. You set the horizontal curve depths for the top, right, bottom, and left sides.
2. You set the vertical curve depths for the top, right, bottom, and left sides.

When these two sets of curves intersect, they create beautiful, asymmetric shapes that feel organic and fluid instead of rigid and geometric.

---

## Creating a Perfect "Blob"

To create a fluid blob, you want to use **percentages** rather than absolute pixel values. Percentages scale automatically with the size of your element.

Here is a classic recipe for a smooth organic shape:

```css
border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
```

If you analyze this:
* **Horizontal curves**: Top-left starts deep (60%), top-right is shallower (40%), bottom-right is tight (30%), and bottom-left is wide (70%).
* **Vertical curves**: Top-left curves down (60%), top-right is shallow (30%), bottom-right goes high (70%), and bottom-left is moderate (40%).

The result is an organic, asymmetric shape that looks incredibly premium as a background accent or image container.

---

## Interactive 8-Value Border Radius Generator

Use the sliders below to adjust the horizontal and vertical radii for all four corners independently. Watch the preview shape change in real-time, click a preset to get started, and copy the clean CSS code when you're done.

<div class="interactive-widget-box">
  <div class="widget-header">
    <div class="widget-title">🔮 Interactive Organic Shape Builder</div>
    <div class="widget-badge">100% Client-Side</div>
  </div>
  <div class="widget-grid" style="gap: 25px;">
    <!-- Left: Preview & Presets -->
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
      <div id="blob-preview" style="width: 180px; height: 180px; background: linear-gradient(135deg, var(--primary, #f97316) 0%, var(--primary-dark, #ea580c) 100%); transition: border-radius 0.2s ease, box-shadow 0.3s ease; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.25); border: 2px solid rgba(255, 255, 255, 0.1);"></div>
      <div style="width: 100%;">
        <label style="display:block; font-size:0.8rem; margin-bottom:5px; color:var(--gray); text-align:center;">Quick Presets</label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
          <button id="preset-blob1" class="widget-btn" style="padding: 6px;">💧 Fluid Blob</button>
          <button id="preset-blob2" class="widget-btn" style="padding: 6px;">🍃 Organic Leaf</button>
          <button id="preset-egg" class="widget-btn" style="padding: 6px;">🥚 Smooth Egg</button>
          <button id="preset-pillow" class="widget-btn" style="padding: 6px;">🛋️ Soft Pillow</button>
        </div>
      </div>
    </div>
    <!-- Right: Sliders -->
    <div>
      <div style="margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: bold; color: var(--white); display: block; border-bottom: 1px solid var(--border); padding-bottom: 4px; margin-bottom: 8px;">Horizontal Radii (width curve)</span>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px;">
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Top Left: <span id="val-tlh" style="color:var(--primary);">60%</span></label>
            <input type="range" id="slider-tlh" min="0" max="100" value="60" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Top Right: <span id="val-trh" style="color:var(--primary);">40%</span></label>
            <input type="range" id="slider-trh" min="0" max="100" value="40" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Bottom Right: <span id="val-brh" style="color:var(--primary);">30%</span></label>
            <input type="range" id="slider-brh" min="0" max="100" value="30" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Bottom Left: <span id="val-blh" style="color:var(--primary);">70%</span></label>
            <input type="range" id="slider-blh" min="0" max="100" value="70" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
        </div>
      </div>
      <div>
        <span style="font-size: 0.85rem; font-weight: bold; color: var(--white); display: block; border-bottom: 1px solid var(--border); padding-bottom: 4px; margin-bottom: 8px;">Vertical Radii (height curve)</span>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px;">
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Top Left: <span id="val-tlv" style="color:var(--primary);">60%</span></label>
            <input type="range" id="slider-tlv" min="0" max="100" value="60" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Top Right: <span id="val-trv" style="color:var(--primary);">30%</span></label>
            <input type="range" id="slider-trv" min="0" max="100" value="30" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Bottom Right: <span id="val-brv" style="color:var(--primary);">70%</span></label>
            <input type="range" id="slider-brv" min="0" max="100" value="70" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--gray);">Bottom Left: <span id="val-blv" style="color:var(--primary);">40%</span></label>
            <input type="range" id="slider-blv" min="0" max="100" value="40" style="width:100%; height:4px; accent-color:var(--primary);">
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="margin-top: 15px;">
    <label style="display:block; font-size:0.8rem; margin-bottom:5px; color:var(--gray);">Generated CSS code:</label>
    <div id="blob-css-output" class="widget-output" style="height:auto; padding:12px; font-size:0.85rem; white-space:pre-wrap; word-break:break-all; margin-bottom: 10px;">border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;</div>
  </div>
  <div class="widget-controls" style="margin-top: 10px;">
    <button id="blob-copy-btn" class="widget-btn widget-btn-primary">📋 Copy CSS</button>
    <button id="blob-random-btn" class="widget-btn">🎲 Randomize Shape</button>
  </div>
  <div id="blob-status" class="widget-status"></div>
</div>

<script is:inline>
  document.addEventListener('DOMContentLoaded', () => {
    // Sliders
    const tlh = document.getElementById('slider-tlh');
    const trh = document.getElementById('slider-trh');
    const brh = document.getElementById('slider-brh');
    const blh = document.getElementById('slider-blh');

    const tlv = document.getElementById('slider-tlv');
    const trv = document.getElementById('slider-trv');
    const brv = document.getElementById('slider-brv');
    const blv = document.getElementById('slider-blv');

    // Values labels
    const valTlh = document.getElementById('val-tlh');
    const valTrh = document.getElementById('val-trh');
    const valBrh = document.getElementById('val-brh');
    const valBlh = document.getElementById('val-blh');

    const valTlv = document.getElementById('val-tlv');
    const valTrv = document.getElementById('val-trv');
    const valBrv = document.getElementById('val-brv');
    const valBlv = document.getElementById('val-blv');

    // Display elements
    const preview = document.getElementById('blob-preview');
    const cssOutput = document.getElementById('blob-css-output');
    const copyBtn = document.getElementById('blob-copy-btn');
    const randomBtn = document.getElementById('blob-random-btn');
    const status = document.getElementById('blob-status');

    // Presets
    const p1 = document.getElementById('preset-blob1');
    const p2 = document.getElementById('preset-blob2');
    const p3 = document.getElementById('preset-egg');
    const p4 = document.getElementById('preset-pillow');

    function updateBlob() {
      const radiusString = `${tlh.value}% ${trh.value}% ${brh.value}% ${blh.value}% / ${tlv.value}% ${trv.value}% ${brv.value}% ${blv.value}%`;
      
      // Update label texts
      valTlh.textContent = `${tlh.value}%`;
      valTrh.textContent = `${trh.value}%`;
      valBrh.textContent = `${brh.value}%`;
      valBlh.textContent = `${blh.value}%`;

      valTlv.textContent = `${tlv.value}%`;
      valTrv.textContent = `${trv.value}%`;
      valBrv.textContent = `${brv.value}%`;
      valBlv.textContent = `${blv.value}%`;

      // Apply style
      preview.style.borderRadius = radiusString;

      // Update CSS code text
      cssOutput.textContent = `border-radius: ${radiusString};`;
    }

    function setSliders(values) {
      tlh.value = values[0];
      trh.value = values[1];
      brh.value = values[2];
      blh.value = values[3];
      
      tlv.value = values[4];
      trv.value = values[5];
      brv.value = values[6];
      blv.value = values[7];
      
      updateBlob();
    }

    // Attach events to all inputs
    const inputs = [tlh, trh, brh, blh, tlv, trv, brv, blv];
    inputs.forEach(input => {
      input.addEventListener('input', updateBlob);
    });

    // Preset handlers
    p1.addEventListener('click', () => setSliders([60, 40, 30, 70, 60, 30, 70, 40]));
    p2.addEventListener('click', () => setSliders([50, 50, 20, 80, 80, 20, 50, 50]));
    p3.addEventListener('click', () => setSliders([50, 50, 50, 50, 65, 65, 35, 35]));
    p4.addEventListener('click', () => setSliders([60, 60, 60, 60, 40, 40, 40, 40]));

    // Randomizer
    randomBtn.addEventListener('click', () => {
      const randVals = Array.from({length: 8}, () => Math.floor(Math.random() * 60) + 20); // range 20%-80%
      setSliders(randVals);
    });

    // Copy Handler
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cssOutput.textContent);
        status.textContent = '✨ Code copied successfully!';
        status.className = 'widget-status status-success';
        setTimeout(() => {
          status.textContent = '';
          status.className = 'widget-status';
        }, 3000);
      } catch (err) {
        status.textContent = '❌ Failed to copy to clipboard.';
        status.className = 'widget-status status-error';
      }
    });

    // Initial load
    updateBlob();
  });
</script>

---

## Practical Layout Techniques

Understanding the math is one thing, but how do we implement this inside actual UI layouts? Here are three modern use cases for organic shapes in CSS.

### 1. The Fluid Image Mask
Instead of placing profile pictures in rigid circles, you can apply a fluid `border-radius` to make standard portraits look highly stylized:

```css
.avatar-blob {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}
```

### 2. Animated Blobs (The Hover Effect)
By using CSS transitions, you can animate between two different `border-radius` values to make an element morph smoothly when the user hovers over it:

```css
.interactive-card {
  width: 250px;
  height: 250px;
  background: var(--primary);
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  transition: border-radius 1s ease-in-out;
}

.interactive-card:hover {
  border-radius: 40% 60% 70% 30% / 70% 40% 30% 60%;
}
```

*Note: For the smoothest morphing animation, keep your transitions around `1s` to `2s` with `ease-in-out` timing.*

### 3. Layered Background Accents
By layering multiple organic shapes with different gradients, opacities, and sizes, you can build rich abstract backgrounds. You can even add subtle infinite spin animations:

```css
@keyframes slow-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.background-blob {
  position: absolute;
  filter: blur(40px);
  opacity: 0.15;
  animation: slow-spin 20s linear infinite;
}
```

---

## Level Up Your CSS
If you need more advanced or precise customization of CSS shapes, head over to our main [Border Radius Generator](file:///f:/Github%20Projects/WebUtilBox-AstroJsVersion/src/pages/border-radius-generator/index.astro) tool. There you can tweak corner positions visually and preview the layout on a variety of container shapes in real time.
