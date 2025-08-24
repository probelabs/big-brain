(() => {
  'use strict';

  // Debug script to understand current ChatGPT UI structure
  
  function safeGet(elem, propName) {
    try { return elem[propName](); } catch (_) { return null; }
  }
  
  function safeGetArray(elem, propName) {
    try { return elem[propName](); } catch (_) { return []; }
  }

  function exploreElement(elem, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return { type: 'max_depth_reached' };
    
    const role = safeGet(elem, 'role');
    const desc = safeGet(elem, 'description');
    const title = safeGet(elem, 'title');
    const value = safeGet(elem, 'value');
    const children = safeGetArray(elem, 'uiElements');
    
    const result = {
      role: role,
      description: desc ? String(desc).substring(0, 100) : null,
      title: title ? String(title).substring(0, 50) : null,
      value: value ? String(value).substring(0, 50) : null,
      childCount: children.length
    };
    
    if (children.length > 0 && depth < maxDepth) {
      result.children = children.slice(0, 5).map(child => 
        exploreElement(child, depth + 1, maxDepth)
      );
    }
    
    return result;
  }

  const se = Application('System Events');
  const proc = se.processes.byName('ChatGPT');
  
  if (!proc.exists()) {
    return JSON.stringify({ error: 'ChatGPT not running' });
  }
  
  const wins = proc.windows();
  if (wins.length === 0) {
    return JSON.stringify({ error: 'No window' });
  }

  const window = wins[0];
  const structure = exploreElement(window, 0, 4);
  
  return JSON.stringify(structure, null, 2);
})();