/** @type {import('tailwindcss').Config} */
module.exports = {
  // In Tailwind CSS v4, the 'content' array is still used for file scanning.
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Tailwind CSS v4 aims for a more "zero-config" approach.
  // The 'theme' object and 'plugins' are often not explicitly needed
  // in the `tailwind.config.js` file for basic setups, as much
  // is handled internally or via PostCSS.
  // For more advanced customization, you might use a `tailwind.css`
  // file with `@theme` directives or a `postcss.config.js`.
  // Keeping this file minimal for v4.
}
