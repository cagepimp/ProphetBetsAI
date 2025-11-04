import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
const mismatches = [];

// Recursively get all JS/JSX/TS/TSX files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Extract imports from file content
function extractImports(content, filePath) {
  const lines = content.split('\n');
  const imports = [];

  lines.forEach((line, index) => {
    // Match import statements with relative paths
    const match = line.match(/import\s+.*\s+from\s+['"](\.[^'"]+)['"]/);
    if (match) {
      imports.push({
        line: index + 1,
        statement: line.trim(),
        importPath: match[1]
      });
    }
  });

  return imports;
}

// Get the actual filename with exact case from directory
function getActualFilename(dir, filename) {
  try {
    const files = fs.readdirSync(dir);
    // Find exact case match
    const found = files.find(f => f.toLowerCase() === filename.toLowerCase());
    return found || null;
  } catch (e) {
    return null;
  }
}

// Check exact case of import path
function checkImportCase(importPath, fromFile) {
  const fromDir = path.dirname(fromFile);

  // Split the import path into segments
  const segments = importPath.split('/').filter(s => s !== '.' && s !== '..');

  // Count how many levels up we go
  let currentDir = fromDir;
  const upLevels = (importPath.match(/\.\.\//g) || []).length;
  for (let i = 0; i < upLevels; i++) {
    currentDir = path.dirname(currentDir);
  }

  // Now traverse down through segments
  let actualPath = currentDir;
  const actualSegments = [];

  for (const segment of segments) {
    const actualName = getActualFilename(actualPath, segment);
    if (!actualName) {
      // Try with extensions
      const extensions = ['.js', '.jsx', '.ts', '.tsx'];
      let found = false;
      for (const ext of extensions) {
        const withExt = getActualFilename(actualPath, segment + ext);
        if (withExt) {
          actualSegments.push(withExt);
          actualPath = path.join(actualPath, withExt);
          found = true;
          break;
        }
      }
      if (!found) {
        return { found: false, segment };
      }
    } else {
      actualSegments.push(actualName);
      actualPath = path.join(currentDir, ...actualSegments);
    }
  }

  // Compare segments
  const importSegments = segments;
  let hasMismatch = false;
  const mismatches = [];

  for (let i = 0; i < importSegments.length; i++) {
    const importSeg = importSegments[i];
    const actualSeg = actualSegments[i];

    // Remove extension from actual segment for comparison
    let actualSegWithoutExt = actualSeg;
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    for (const ext of extensions) {
      if (actualSeg.endsWith(ext)) {
        actualSegWithoutExt = actualSeg.slice(0, -ext.length);
        break;
      }
    }

    if (importSeg !== actualSegWithoutExt) {
      hasMismatch = true;
      mismatches.push({
        position: i,
        imported: importSeg,
        actual: actualSegWithoutExt
      });
    }
  }

  return {
    found: true,
    hasMismatch,
    mismatches,
    actualSegments
  };
}

// Process all files
const allFiles = getAllFiles(srcDir);

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const imports = extractImports(content, file);

  imports.forEach(imp => {
    const result = checkImportCase(imp.importPath, file);

    if (!result.found) {
      mismatches.push({
        file: file,
        line: imp.line,
        statement: imp.statement,
        issue: 'FILE_NOT_FOUND',
        importPath: imp.importPath,
        notFoundSegment: result.segment
      });
    } else if (result.hasMismatch) {
      // Build the correct import path
      const upLevels = (imp.importPath.match(/\.\.\//g) || []).length;
      const prefix = '../'.repeat(upLevels) || './';

      const correctedSegments = result.actualSegments.map(seg => {
        // Remove extension
        const extensions = ['.js', '.jsx', '.ts', '.tsx'];
        for (const ext of extensions) {
          if (seg.endsWith(ext)) {
            return seg.slice(0, -ext.length);
          }
        }
        return seg;
      });

      const correctedPath = prefix + correctedSegments.join('/');

      mismatches.push({
        file: file,
        line: imp.line,
        statement: imp.statement,
        issue: 'CASE_MISMATCH',
        importPath: imp.importPath,
        correctPath: correctedPath,
        details: result.mismatches
      });
    }
  });
});

// Output results
if (mismatches.length === 0) {
  console.log('✓ No import case mismatches found!');
} else {
  console.log(`\n⚠ Found ${mismatches.length} import case mismatch(es):\n`);
  console.log('='.repeat(80));
  mismatches.forEach((m, i) => {
    console.log(`\n${i + 1}. ${m.issue}`);
    console.log(`   File: ${m.file}`);
    console.log(`   Line: ${m.line}`);
    console.log(`   Statement: ${m.statement}`);
    if (m.issue === 'CASE_MISMATCH') {
      console.log(`   Current import: "${m.importPath}"`);
      console.log(`   Correct import: "${m.correctPath}"`);
      console.log(`   Mismatched segments:`);
      m.details.forEach(d => {
        console.log(`      - "${d.imported}" should be "${d.actual}"`);
      });
    } else {
      console.log(`   Import path: ${m.importPath} (file not found)`);
      console.log(`   Missing segment: ${m.notFoundSegment}`);
    }
  });
  console.log('\n' + '='.repeat(80) + '\n');
}
