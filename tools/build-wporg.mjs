#!/usr/bin/env node
/**
 * Prepare a separate WordPress.org submission CANDIDATE, not a certified release.
 * The original Brendigo-branded GitHub plugin remains unchanged.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'wordpress/brendigo-cookieconsent');
const dest=path.join(root,'dist/wporg/brendigo-cookieconsent');
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.cpSync(source,dest,{recursive:true});
function edit(file, transform) {
  const original=fs.readFileSync(file,'utf8');
  const changed=transform(original);
  if(changed===original)throw Error('Build transform failed for '+file);
  fs.writeFileSync(file,changed,'utf8');
}
edit(path.join(dest,'brendigo-cookieconsent.php'),original=>{
  let php=original;
  function replace(from,to,label) {
    if(!php.includes(from))throw Error('Missing PHP template: '+label);
    php=php.replace(from,to);
  }
  replace(' * Update URI: https://cookie.brendigo.com\n','', 'Update URI');
  replace("        'google_basic' => 0,",
    "        'google_basic' => 0,\n        'show_branding' => 0,", 'default credit');
  replace("        'google_basic' => empty($input['google_basic']) ? 0 : 1,",
    "        'google_basic' => empty($input['google_basic']) ? 0 : 1,\n        'show_branding' => empty($input['show_branding']) ? 0 : 1,", 'sanitize credit');
  replace("        'revision' => (string) $o['revision'],",
    "        'revision' => (string) $o['revision'],\n        'showBranding' => !empty($o['show_branding']),", 'front-end credit');
  replace("    $cdn_mode = $o['asset_source'] === 'cdn';", "    $cdn_mode = false;", 'local-only runtime');
  replace("($cdn_mode ? 'wp-cdn-loader.js' : 'brendigo-cookieconsent.js')", "'brendigo-cookieconsent.js'", 'local-only script');
  const cdnBlock=/\/\/ BEGIN CDN BOOTSTRAP[\s\S]*?\/\/ END CDN BOOTSTRAP\n/;
  if(!cdnBlock.test(php))throw Error('Missing CDN bootstrap block');
  php=php.replace(cdnBlock,'');
  replace("'asset_source' => in_array($asset_source, ['local','cdn'], true) ? $asset_source : 'local',",
    "'asset_source' => 'local',",'disable remote asset setting');
  const assetRow=/\s*<tr>\s*<th scope="row"><label for="bcc-assets">[\s\S]*?<\/tr>/;
  if(!assetRow.test(php))throw Error('Missing asset selector row');
  php=php.replace(assetRow,`
                <tr>
                    <th scope="row">Asset delivery</th>
                    <td><p>Local plugin assets only (WordPress.org edition).</p></td>
                </tr>`);
  const creditRow=/\s*<tr>\s*<th scope="row"><\?php esc_html_e\('Attribution',[\s\S]*?<\/tr>/;
  if(!creditRow.test(php))throw Error('Missing attribution row');
  php=php.replace(creditRow,`
                <tr>
                    <th scope="row"><?php esc_html_e('Attribution (optional)', 'brendigo-cookieconsent'); ?></th>
                    <td><label><input type="checkbox" name="<?php echo esc_attr(OPTION); ?>[show_branding]"
                        value="1" <?php checked($o['show_branding'], 1); ?>>
                        <?php esc_html_e('Display by Brendigo in the public banner (off by default)', 'brendigo-cookieconsent'); ?>
                    </label></td>
                </tr>`);
  return php;
});
edit(path.join(dest,'assets/brendigo-cookieconsent.js'),source=>{
  const count=(source.match(/\bbranding\(footer,\s*t\);/g)||[]).length;
  if(count!==2)throw Error('Unexpected attribution call count: '+count);
  const configMarker = '      translations: options.translations || null,';
  if(!source.includes(configMarker))throw Error('Missing core configuration marker');
  return source.replace(configMarker, configMarker+'\n      showBranding: options.showBranding === true,')
    .replace(/\bbranding\(footer,\s*t\);/g,
    'if (config && config.showBranding === true) branding(footer, t);');
});
edit(path.join(dest,'readme.txt'),source=>source
 .replace('Always-visible "by Brendigo" credit in the official interface.',
   'Optional "by Brendigo" public credit (off by default).')
 .replace('Optional versioned CDN assets; local delivery is the default.',
   'Local JS and CSS assets only in this edition.')
 .replace('The official plugin has no setting to disable the visible credit. The MIT software license allows source modifications.',
   'Public credit is optional and disabled by default in this directory submission candidate.')
 .replace('Yes. Local delivery is the default and has no required external runtime libraries.',
   'Yes. All assets are served locally without external runtime libraries.'));
fs.rmSync(path.join(dest,'assets/wp-cdn-loader.js'));
console.log('Prepared WordPress.org submission candidate at dist/wporg/brendigo-cookieconsent');
