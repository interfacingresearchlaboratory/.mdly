import { docs, meta } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";

// The fumadocs collection from _runtime.doc([...]) - need to extract the array
const docsAsAny = docs as any;

// Based on .source/index.ts, docs is created as: _runtime.doc([{ info: {...}, data: ... }, ...])
// The _runtime.doc() function wraps the array, but we need to access the original array
let docsArray: any[] = [];

// Try to extract the array - fumadocs collections are typically iterable
try {
  // First, try if it's directly iterable
  if (docsAsAny && typeof docsAsAny[Symbol.iterator] === 'function') {
    docsArray = Array.from(docsAsAny);
  }
  // If that didn't work or returned empty, try direct array access
  if (docsArray.length === 0 && Array.isArray(docsAsAny)) {
    docsArray = docsAsAny;
  }
  // If still empty, try array-like access
  if (docsArray.length === 0 && docsAsAny && typeof docsAsAny.length === 'number') {
    const extracted: any[] = [];
    for (let i = 0; i < docsAsAny.length; i++) {
      if (docsAsAny[i] !== undefined) {
        extracted.push(docsAsAny[i]);
      }
    }
    if (extracted.length > 0) {
      docsArray = extracted;
    }
  }
} catch (e) {
  console.error('[Docs Source] Error extracting docs array:', e);
}

const pageFiles = docsArray.map((doc: any) => {
  // The doc structure from fumadocs: { _file: { path, absolutePath }, ...data }
  let path = '';
  let data = doc;
  
  // Check _file.path - try multiple access methods
  let filePath = '';
  try {
    // Method 1: Direct access
    if (doc?._file?.path) {
      filePath = doc._file.path;
    }
    // Method 2: Bracket notation
    else if (doc?.['_file']?.['path']) {
      filePath = doc['_file']['path'];
    }
    // Method 3: Try to get the descriptor
    else {
      const fileProp = Object.getOwnPropertyDescriptor(doc, '_file');
      if (fileProp?.value?.path) {
        filePath = fileProp.value.path;
      } else if (fileProp?.get) {
        // It's a getter, call it
        const fileValue = fileProp.get.call(doc);
        if (fileValue?.path) {
          filePath = fileValue.path;
        }
      }
    }
    
    if (filePath) {
      path = filePath;
    }
    // Try _file.absolutePath if path not found
    else {
      let fileAbsolutePath = '';
      if (doc?._file?.absolutePath) {
        fileAbsolutePath = doc._file.absolutePath;
      } else if (doc?.['_file']?.['absolutePath']) {
        fileAbsolutePath = doc['_file']['absolutePath'];
      }
      
      if (fileAbsolutePath) {
        const contentDocsIndex = fileAbsolutePath.indexOf('/content/docs/');
        if (contentDocsIndex !== -1) {
          path = fileAbsolutePath.substring(contentDocsIndex + '/content/docs/'.length);
        }
      }
    }
  } catch (e) {
    // _file access failed, will try other methods below
  }
  
  // Check info.path (original structure from _runtime.doc)
  if (!path && doc?.info?.path) {
    path = doc.info.path;
    data = doc.data || doc;
  }
  // Check info.absolutePath
  else if (!path && doc?.info?.absolutePath) {
    const absolutePath = doc.info.absolutePath;
    const contentDocsIndex = absolutePath.indexOf('/content/docs/');
    if (contentDocsIndex !== -1) {
      path = absolutePath.substring(contentDocsIndex + '/content/docs/'.length);
    }
    data = doc.data || doc;
  }
  // Check data._file.path
  else if (!path && doc?.data?._file) {
    try {
      if (doc.data._file?.path) {
        path = doc.data._file.path;
      } else if (doc.data._file?.absolutePath) {
        const absolutePath = doc.data._file.absolutePath;
        const contentDocsIndex = absolutePath.indexOf('/content/docs/');
        if (contentDocsIndex !== -1) {
          path = absolutePath.substring(contentDocsIndex + '/content/docs/'.length);
        }
      }
      data = doc.data;
    } catch (e) {
      // Ignore
    }
  }
  
  // Remove .mdx extension
  const cleanPath = path.replace(/\.mdx$/, '');
  
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && !cleanPath) {
    console.warn('[Docs Source] No path extracted. Trying direct access...');
    // Try direct property access for debugging
    try {
      const directFile = (doc as any)._file;
      console.warn('[Docs Source] Direct _file access:', directFile ? (directFile.path || 'no path') : 'null');
      console.warn('[Docs Source] Doc keys:', Object.keys(doc || {}).slice(0, 15));
    } catch (e) {
      console.warn('[Docs Source] Error accessing _file:', e);
    }
  }
  
  return {
    type: "page" as const,
    path: cleanPath,
    data: data,
  };
}).filter((file) => file.path); // Filter out files without paths

// Handle meta files
const metaArray = Array.isArray(meta) ? meta : [];
const metaFiles = metaArray.map((m: any) => ({
  type: "meta" as const,
  path: m?.info?.path || m?.path || "meta.json",
  data: m?.data || m || {},
}));

const allFiles = [...pageFiles, ...metaFiles];


export const source = loader({
  baseUrl: "/",
  source: {
    files: allFiles,
  },
});
