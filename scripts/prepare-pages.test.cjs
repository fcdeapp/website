/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { preparePages, MAX_FILE_BYTES } = require('./prepare-pages.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'website-pages-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'out');
  const destination = path.join(root, 'out-pages');
  const write = (name, data = 'asset') => {
    const file = path.join(source, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
    return file;
  };
  write('index.html', '<html>website</html>');
  return { source, destination, write };
}

test('excludes hydrated source ZIPs while preserving routes, GLB, content, SW and domain', t => {
  const f = fixture(t);
  const zip = f.write('daewanggorae/bodyparts3d/isa_BP3D_4.0_obj_99.zip');
  fs.truncateSync(zip, MAX_FILE_BYTES + 1);
  f.write('daewanggorae/medicine/manifest.json');
  f.write('nested/.DS_Store');
  const assets = ['CNAME', '404.html', '_next/static/app.js', 'mdeet/index.html',
    'daewanggorae/anatomy.html', 'daewanggorae/sw.js', 'daewanggorae/runtime/manifest.json',
    'daewanggorae/runtime/content/a.json', 'daewanggorae/runtime/models/heart.glb',
    'daewanggorae/runtime/THIRD_PARTY_LICENSES.txt'];
  assets.forEach(name => f.write(name, `content:${name}`));
  const result = preparePages(f);
  assert.equal(result.files, assets.length + 1);
  assert.ok(!fs.existsSync(path.join(f.destination, 'daewanggorae/bodyparts3d')));
  assert.ok(!fs.existsSync(path.join(f.destination, 'daewanggorae/medicine')));
  assert.equal(fs.statSync(zip).size, MAX_FILE_BYTES + 1);
  for (const name of assets) assert.deepEqual(fs.readFileSync(path.join(f.destination, name)), fs.readFileSync(path.join(f.source, name)));
});

test('blocks oversized runtime assets before replacing the previous publishing directory', t => {
  const f = fixture(t);
  preparePages(f);
  fs.truncateSync(f.write('daewanggorae/runtime/models/too-large.glb'), MAX_FILE_BYTES);
  assert.throws(() => preparePages(f), /file limit exceeded.*too-large.glb/);
  assert.ok(fs.existsSync(path.join(f.destination, 'index.html')));
});

test('blocks unresolved LFS pointers for assets that will be published', t => {
  const f = fixture(t);
  f.write('videos/demo.mp4', 'version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 12\n');
  assert.throws(() => preparePages(f), /Unresolved Git LFS pointer: videos\/demo.mp4/);
});

test('checks total site size and refuses overlapping source/destination paths', t => {
  const f = fixture(t);
  assert.throws(() => preparePages({ ...f, maxSiteBytes: 1 }), /site limit exceeded/);
  assert.throws(() => preparePages({ ...f, destination: f.source }), /separate directories/);
});

test('rebuilds generated staging without retaining stale source archives', t => {
  const f = fixture(t);
  preparePages(f);
  fs.writeFileSync(path.join(f.destination, 'stale.zip'), 'old');
  preparePages(f);
  assert.ok(!fs.existsSync(path.join(f.destination, 'stale.zip')));
});

test('rejects symlink assets', t => {
  const f = fixture(t);
  fs.symlinkSync(path.join(f.source, 'index.html'), path.join(f.source, 'link.html'));
  assert.throws(() => preparePages(f), /Unexpected publishing symlink/);
});

test('publishes support HTML and a directory index for direct trailing-slash visits', t => {
  const f = fixture(t);
  const html = '<html><h1>고객지원</h1></html>';
  f.write('daewanggorae/support.html', html);
  const result = preparePages(f);
  for (const route of ['daewanggorae/support.html', 'daewanggorae/support/index.html']) {
    assert.equal(fs.readFileSync(path.join(f.destination, route), 'utf8'), html);
  }
  assert.equal(result.files, 3);
  assert.equal(result.totalBytes, Buffer.byteLength('<html>website</html>') + Buffer.byteLength(html) * 2);
  assert.throws(() => preparePages({ ...f, maxSiteBytes: result.totalBytes - 1 }), /site limit exceeded/);
});
