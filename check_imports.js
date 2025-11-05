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
function extractImports(content) {
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

// Check if file exists with exact case
function checkFileExists(importPath, fromFile) {
  const fromDir = path.dirname(fromFile);
  let resolvedPath = path.resolve(fromDir, importPath);

  // Try with common extensions if no extension provided
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
  let foundPath = null;

  for (const ext of extensions) {
    const testPath = resolvedPath + ext;
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
      foundPath = testPath;
      break;
    }
  }

  // Also check for index files if it's a directory
  if (!foundPath && fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
      const indexPath = path.join(resolvedPath, 'index' + ext);
      if (fs.existsSync(indexPath)) {
        foundPath = indexPath;
        break;
      }
    }
  }

  return foundPath;
}

// Verify case sensitivity
function verifyCaseSensitivity(actualPath, importedPath, fromFile) {
  const fromDir = path.dirname(fromFile);
  let resolvedImport = path.resolve(fromDir, importedPath);

  // Remove extension from resolvedImport if it doesn't have one
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  for (const ext of extensions) {
    if (resolvedImport.endsWith(ext)) {
      resolvedImport = resolvedImport.slice(0, -ext.length);
      break;
    }
  }

  // Get actual path without extension
  let actualWithoutExt = actualPath;
  for (const ext of extensions) {
    if (actualPath.endsWith(ext)) {
      actualWithoutExt = actualPath.slice(0, -ext.length);
      break;
    }
  }

  // Check each path segment for case mismatch
  const importSegments = resolvedImport.split(path.sep);
  const actualSegments = actualWithoutExt.split(path.sep);

  // Find where they differ
  for (let i = 0; i < Math.min(importSegments.length, actualSegments.length); i++) {
    if (importSegments[i] !== actualSegments[i]) {
      return {
        mismatch: true,
        importSegment: importSegments[i],
        actualSegment: actualSegments[i]
      };
    }
  }

  return { mismatch: false };
}

// Process all files
const allFiles = getAllFiles(srcDir);

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const imports = extractImports(content, file);

  imports.forEach(imp => {
    const actualFile = checkFileExists(imp.importPath, file);

    if (!actualFile) {
      mismatches.push({
        file: file,
        line: imp.line,
        statement: imp.statement,
        issue: 'FILE_NOT_FOUND',
        importPath: imp.importPath
      });
    } else {
      const caseCheck = verifyCaseSensitivity(actualFile, imp.importPath, file);
      if (caseCheck.mismatch) {
        mismatches.push({
          file: file,
          line: imp.line,
          statement: imp.statement,
          issue: 'CASE_MISMATCH',
          importPath: imp.importPath,
          actualPath: actualFile,
          details: caseCheck
        });
      }
    }
  });
});

// Output results
if (mismatches.length === 0) {
  console.log('No import mismatches found!');
} else {
  console.log(`Found ${mismatches.length} import mismatch(es):\n`);
  mismatches.forEach((m, i) => {
    console.log(`${i + 1}. ${m.issue}`);
    console.log(`   File: ${m.file}`);
    console.log(`   Line: ${m.line}`);
    console.log(`   Statement: ${m.statement}`);
    if (m.issue === 'CASE_MISMATCH') {
      console.log(`   Import path: ${m.importPath}`);
      console.log(`   Actual path: ${m.actualPath}`);
      console.log(`   Mismatch: "${m.details.importSegment}" should be "${m.details.actualSegment}"`);
    } else {
      console.log(`   Import path: ${m.importPath} (file not found)`);
    }
    console.log('');
  });
}
