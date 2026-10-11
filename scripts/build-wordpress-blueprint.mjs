// Builds the WordPress Playground blueprint for the Entrelingo landing page.
// Output: deliverables/wordpress/{landing.html, preview.html, blueprint.json, playground-url.txt}
// Usage: node scripts/build-wordpress-blueprint.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const WEBHOOK_URL = "https://hook.us2.make.com/wa5wmat0d10dge7gl5ftojstm83xdoc4";
const landing = readFileSync(join(root, "scripts", "landing", "entrelingo.html"), "utf8").replace("__WEBHOOK_URL__", WEBHOOK_URL).trim();

// WordPress rewrites "&&" inside post content to "&#038;&#038;" (convert_chars), which breaks any inline JavaScript.
// So the page body keeps only HTML + CSS, and the script is printed from a must-use plugin in the footer, outside
// the content filters. The same plugin hides the admin bar so visitors see the landing exactly as designed.
const scriptMatch = landing.match(/<script>([\s\S]*)<\/script>\s*$/);
if (!scriptMatch) throw new Error("Expected the landing to end with a <script> block");
const landingHtml = landing.slice(0, scriptMatch.index).trim();
const landingJs = scriptMatch[1].trim();

const muPlugin = `<?php
add_filter('show_admin_bar', '__return_false');
add_action('wp_footer', function () {
  if (is_front_page()) {
    echo "<script>\n" . file_get_contents('/wordpress/landing.js') . "\n</script>";
  }
}, 99);
`;

const php = `<?php
require_once '/wordpress/wp-load.php';
wp_set_current_user(1);
kses_remove_filters();
$content = "<!-- wp:html -->\n" . file_get_contents('/wordpress/landing.html') . "\n<!-- /wp:html -->";
$id = wp_insert_post(wp_slash([
  'post_title' => 'Entrelingo',
  'post_name' => 'inicio',
  'post_status' => 'publish',
  'post_type' => 'page',
  'post_content' => $content,
]));
update_option('show_on_front', 'page');
update_option('page_on_front', $id);
update_option('blogname', 'Entrelingo');
update_post_meta($id, '_wp_page_template', 'page-no-title');
`;

const blueprint = {
  $schema: "https://playground.wordpress.net/blueprint-schema.json",
  landingPage: "/",
  preferredVersions: { php: "8.2", wp: "latest" },
  login: true,
  steps: [
    { step: "writeFile", path: "/wordpress/wp-content/mu-plugins/entrelingo-landing.php", data: muPlugin },
    { step: "writeFile", path: "/wordpress/landing.js", data: landingJs },
    { step: "writeFile", path: "/wordpress/landing.html", data: landingHtml },
    { step: "runPHP", code: php },
  ],
};

const outDir = join(root, "deliverables", "wordpress");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "landing.html"), landing + "\n");
writeFileSync(
  join(outDir, "preview.html"),
  `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Entrelingo · Vista previa</title></head><body>\n${landing}\n</body></html>\n`,
);
writeFileSync(join(outDir, "blueprint.json"), JSON.stringify(blueprint, null, 2) + "\n");
const url = "https://playground.wordpress.net/#" + encodeURIComponent(JSON.stringify(blueprint)).replace(/%2F/g, "/");
writeFileSync(join(outDir, "playground-url.txt"), url + "\n");
console.log("Written. URL length:", url.length);
