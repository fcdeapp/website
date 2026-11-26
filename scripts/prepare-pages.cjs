/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

// Authoring inputs remain in public/ and Git LFS. The web client reads runtime/.
const SOURCE_ONLY = ['daewanggorae/bodyparts3d', 'daewanggorae/medicine'];
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_SITE_BYTES = 1_000_000_000;

function excluded(relative) {
  return relative.split('/').some(part => part === '.DS_Store' || part === '.git') ||
    SOURCE_ONLY.some(dir => relative === dir || relative.startsWith(`${dir}/`));
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function preparePages({ source, destination, maxFileBytes = MAX_FILE_BYTES, maxSiteBytes = MAX_SITE_BYTES }) {
  source = fs.realpathSync(source);
  destination = path.resolve(destination);
  if (fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink()) {
    throw new Error('Publishing destination must not be a symlink.');
  }
  // Resolve aliases such as macOS /var -> /private/var before overlap checks.
  destination = fs.existsSync(destination) ? fs.realpathSync(destination) :
    path.join(fs.realpathSync(path.dirname(destination)), path.basename(destination));
  if (isWithin(source, destination) || isWithin(destination, source)) {
    throw new Error('Publishing source and destination must be separate directories.');
  }
  if (!fs.statSync(path.join(source, 'index.html')).isFile()) {
    throw new Error('Missing index.html. Run npm run build first.');
  }

  const files = [];
  const skipped = [];
  let totalBytes = 0;
  function scan(relative = '') {
    for (const entry of fs.readdirSync(path.join(source, relative), { withFileTypes: true })) {
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (excluded(name)) { skipped.push(name); continue; }
      if (entry.isSymbolicLink()) throw new Error(`Unexpected publishing symlink: ${name}`);
      if (entry.isDirectory()) { scan(name); continue; }
      if (!entry.isFile()) throw new Error(`Unexpected publishing entry: ${name}`);
      const file = path.join(source, name);
      const size = fs.statSync(file).size;
      if (size >= maxFileBytes) {
        throw new Error(`GitHub file limit exceeded: ${name} (${(size / 1024 / 1024).toFixed(2)} MiB). Supply a web asset below 100 MiB or host it separately.`);
      }
      // An unhydrated LFS pointer must never replace a downloadable asset.
      if (size <= 1024 && fs.readFileSync(file, 'utf8').startsWith('version https://git-lfs.github.com/spec/v1')) {
        throw new Error(`Unresolved Git LFS pointer: ${name}. Fetch this asset before publishing.`);
      }
      totalBytes += size;
      files.push(name);
    }
  }
  scan();
  if (totalBytes > maxSiteBytes) {
    throw new Error(`GitHub Pages site limit exceeded: ${(totalBytes / 1_000_000).toFixed(1)} MB (maximum 1 GB).`);
  }

  // Only the disposable publishing directory is rebuilt; source/out are untouched.
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  for (const name of files) {
    const target = path.join(destination, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(source, name), target, fs.constants.COPYFILE_FICLONE);
  }
  return { files: files.length, totalBytes, skipped };
}

module.exports = { preparePages, excluded, MAX_FILE_BYTES, MAX_SITE_BYTES };

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  try {
    const result = preparePages({ source: path.join(root, 'out'), destination: path.join(root, 'out-pages') });
    console.log(`Publishing ${result.files} files, ${(result.totalBytes / 1024 / 1024).toFixed(2)} MiB.`);
    console.log(`Excluded source-only / metadata paths: ${result.skipped.join(', ') || '(none)'}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
