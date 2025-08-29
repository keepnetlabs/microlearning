/**
 * Deep merge function for nested objects and arrays
 * Handles special cases like converting object with numeric keys back to arrays
 * Used by EditModeProvider for merging config changes
 */
export const deepMerge = (target: any, source: any): any => {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;

  const result = { ...target };

  Object.keys(source).forEach(key => {
    if (Array.isArray(source[key])) {
      // For arrays, replace completely
      result[key] = [...source[key]];
    } else if (source[key] && typeof source[key] === 'object') {
      // Special case: if source is object but target is array (like highlights/goals)
      // and source object has numeric keys, convert back to array
      if (Array.isArray(target[key]) &&
        Object.keys(source[key]).every(k => !isNaN(Number(k)))) {
        // Start from existing target array to preserve order and unmodified items
        const arrayResult: any[] = [...target[key]];
        Object.keys(source[key]).forEach(index => {
          const idx = Number(index);
          const targetItem = target[key][idx];
          const sourceItem = source[key][index];
          // Merge recursively to preserve nested structures
          arrayResult[idx] = deepMerge(targetItem || {}, sourceItem);
        });
        result[key] = arrayResult;
      } else {
        // For objects, recursively merge
        result[key] = deepMerge(target[key] || {}, source[key]);
      }
    } else {
      // For primitive values, replace
      result[key] = source[key];
    }
  });

  return result;
};