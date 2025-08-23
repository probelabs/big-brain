(() => {
  'use strict';

  // ULTRA-FAST: Optimized specifically for ChatGPT message extraction
  // Only reads what we absolutely need, skips everything else
  
  const OPTS = {
    maxDepth: 4,           // Just enough to reach messages
    nodeBudget: 100,       // Very small budget - we know the path
    includeDescription: true, // ONLY for AXStaticText
    targetPath: [0, 0, 2], // Direct path to conversation area
  };

  let budget = OPTS.nodeBudget;

  function safeGet(elem, propName) {
    try { return elem[propName](); } catch (_) { return null; }
  }
  
  function safeGetArray(elem, propName) {
    try { return elem[propName](); } catch (_) { return []; }
  }

  // Navigate directly without reading anything
  function directNavigate(window) {
    const path = OPTS.targetPath;
    let current = window;
    
    // Navigate: window > AXGroup[0] > AXSplitGroup[0] > AXGroup[2]
    for (const index of path) {
      const children = safeGetArray(current, 'uiElements');
      if (!children || children.length <= index) return null;
      current = children[index];
      budget--; // Count navigation
    }
    
    return current; // Conversation container
  }

  // Extract messages with absolute minimum calls
  function extractMessages(container) {
    const messages = [];
    
    // Get children of container (looking for ScrollArea)
    const containerChildren = safeGetArray(container, 'uiElements');
    
    // Check first 2 children for ScrollArea
    for (let i = 0; i < Math.min(2, containerChildren.length); i++) {
      if (budget-- <= 0) break;
      
      const child = containerChildren[i];
      const role = safeGet(child, 'role');
      
      if (role === 'AXScrollArea') {
        // Found ScrollArea, dive in
        const scrollChildren = safeGetArray(child, 'uiElements');
        
        // Look for AXList (conversation list)
        for (const scrollChild of scrollChildren) {
          if (budget-- <= 0) break;
          
          if (safeGet(scrollChild, 'role') === 'AXList') {
            // Found outer list, look for inner list
            const outerListChildren = safeGetArray(scrollChild, 'uiElements');
            
            for (const innerList of outerListChildren) {
              if (budget-- <= 0) break;
              
              if (safeGet(innerList, 'role') === 'AXList') {
                // Found message section, extract groups
                const messageGroups = safeGetArray(innerList, 'uiElements');
                
                // Process each message group
                for (const group of messageGroups) {
                  if (budget-- <= 0) break;
                  
                  if (safeGet(group, 'role') === 'AXGroup') {
                    // Extract text from group (minimal recursion)
                    const text = quickExtractText(group, 2); // Max 2 levels deep
                    if (text) {
                      messages.push(text);
                    }
                  }
                }
                
                return messages; // Done!
              }
            }
          }
        }
      }
    }
    
    return messages;
  }

  // Quick text extraction - only AXStaticText description
  function quickExtractText(elem, maxDepth, depth = 0) {
    if (depth > maxDepth || budget-- <= 0) return '';
    
    const role = safeGet(elem, 'role');
    
    // Only read description for AXStaticText
    if (role === 'AXStaticText') {
      const desc = safeGet(elem, 'description');
      return desc ? String(desc) : '';
    }
    
    // For containers, recurse but don't read their properties
    if (role === 'AXGroup' || role === 'AXScrollArea') {
      const texts = [];
      const children = safeGetArray(elem, 'uiElements');
      
      for (const child of children) {
        if (budget <= 0) break;
        const text = quickExtractText(child, maxDepth, depth + 1);
        if (text) texts.push(text);
      }
      
      return texts.join('\n');
    }
    
    return '';
  }

  // MAIN - Minimal execution
  const se = Application('System Events');
  const proc = se.processes.byName('ChatGPT');
  
  if (!proc.exists()) {
    return JSON.stringify({ error: 'ChatGPT not running' });
  }
  
  const wins = proc.windows();
  if (wins.length === 0) {
    return JSON.stringify({ error: 'No window' });
  }

  const t0 = Date.now();
  
  // Direct navigation to conversation area
  const conversationArea = directNavigate(wins[0]);
  if (!conversationArea) {
    return JSON.stringify({ 
      error: 'Conversation area not found',
      nodesChecked: OPTS.nodeBudget - budget
    });
  }
  
  // Extract messages with minimal calls
  const messages = extractMessages(conversationArea);
  
  const t1 = Date.now();
  
  // Return simple array of message texts
  return JSON.stringify({
    messages: messages,
    meta: {
      ms: t1 - t0,
      nodesVisited: OPTS.nodeBudget - budget,
      messageCount: messages.length
    }
  });
})();