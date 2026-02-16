# Screenshots Guide

This folder holds screenshots for the Labour Mobility Registry README. Use dummy/test data only—never real production data.

## Adding or Updating Screenshots

### 1. Capture the Screenshot

1. Start the application: `composer run dev` or `php artisan serve` with `npm run dev`
2. Log in and navigate to the screen you want to capture
3. Use one of these methods:
   - **macOS**: `Cmd+Shift+4` (select area) or `Cmd+Shift+5` (screenshot tool)
   - **Windows**: `Win+Shift+S` (Snipping Tool) or `PrtScn`
   - **Linux**: `PrtScn` or your system's screenshot tool (e.g. Flameshot, GNOME Screenshot)
   - **Browser DevTools**: Right-click → Inspect → toggle device toolbar for mobile views, then capture

### 2. Save to This Folder

Save screenshots as PNG (preferred) or JPG with these filenames:

| Filename | Description |
|----------|-------------|
| `sidebar-user-manual.png` | Sidebar showing User Manual link in the main nav |
| `dashboard-returnee-widgets.png` | Dashboard with returnee metrics (30/90-day returns, match rate) |
| `reports-returnee-compliance.png` | Returnee Compliance report page with period filter |

### 3. Naming Conventions

- Use lowercase and hyphens: `feature-name.png`
- Be descriptive: `batch-detail-with-returnee-fields.png` not `img1.png`

### 4. Image Guidelines

- **Resolution**: 1920×1080 or similar is fine; avoid very large images (compress if > 500KB)
- **Content**: Use dummy data only. Blur or redact any real personal data
- **Browser**: Use a standard view (sidebar expanded) unless showing mobile/responsive behaviour

### 5. Updating the README

The main [README.md](../../README.md) references screenshots in the "Screenshots" section. When adding new features:

1. Add the image file to `docs/screenshots/`
2. Add a line in README.md:
   ```markdown
   **Feature Name** – Brief description.
   ![Alt text](docs/screenshots/your-filename.png)
   ```

### Existing Screenshots (GitHub Assets)

Some screenshots in the README are hosted as GitHub user-attachments. To replace or add new ones:

- **Option A**: Add PNG/JPG files here and reference them as `docs/screenshots/filename.png`
- **Option B**: Upload new images via GitHub’s interface (e.g. in an issue or PR) and use the generated URL
