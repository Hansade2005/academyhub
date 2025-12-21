/**
 * Visual Editor Client - Embedded in production builds
 * Enables visual editing when the app is loaded in an iframe from pipilot.dev
 * Works with both development (E2B) and production (Supabase hosting) scenarios
 */
(function() {
  'use strict';
  
  // Only run in iframe context
  if (window === window.parent) {
    console.log('[VE-Client] Not in iframe, skipping initialization');
    return;
  }

  // Allowed parent origins for security
  // Supports: pipilot.dev main site, *.pipilot.dev subdomains, *.e2b.app E2B URLs, localhost
  const ALLOWED_ORIGINS = [
    'https://pipilot.dev',
    'https://www.pipilot.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
  ];
  
  // Check if origin is allowed (supports wildcards for subdomains)
  function isAllowedOrigin(origin) {
    if (!origin) return false;
    // Exact match
    if (ALLOWED_ORIGINS.includes(origin)) return true;
    // *.pipilot.dev subdomains (e.g., code-lens-stream.pipilot.dev)
    if (origin.endsWith('.pipilot.dev')) return true;
    // *.e2b.app URLs (e.g., 3000-ikmd9ltiykjsfg57q5pf3.e2b.app)
    if (origin.endsWith('.e2b.app')) return true;
    return false;
  }

  // State
  let isEnabled = false;
  let selectedElements = new Map();
  let hoveredElement = null;
  let hoverOverlay = null;
  let selectionOverlays = new Map();
  let elementIdCounter = 1;
  const elementIdMap = new WeakMap();

  // Generate unique element ID using DOM path
  function generateElementId(element) {
    if (elementIdMap.has(element)) {
      return elementIdMap.get(element);
    }
    
    // Check for existing data-ve-id (from build-time plugin)
    const existingId = element.getAttribute('data-ve-id');
    if (existingId) {
      elementIdMap.set(element, existingId);
      return existingId;
    }
    
    // Generate DOM path-based ID for production
    const path = getDOMPath(element);
    const id = 've-' + path;
    element.setAttribute('data-ve-id', id);
    elementIdMap.set(element, id);
    return id;
  }

  // Get DOM path for element identification
  function getDOMPath(element) {
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += '#' + current.id;
        path.unshift(selector);
        break;
      }
      
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (classes) selector += '.' + classes;
      }
      
      // Add index if needed
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current);
          selector += ':nth(' + index + ')';
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join('>');
  }

  // Get computed styles for an element
  function getComputedStyleInfo(element) {
    const computed = window.getComputedStyle(element);
    return {
      display: computed.display,
      position: computed.position,
      flexDirection: computed.flexDirection,
      justifyContent: computed.justifyContent,
      alignItems: computed.alignItems,
      gap: computed.gap,
      marginTop: computed.marginTop,
      marginRight: computed.marginRight,
      marginBottom: computed.marginBottom,
      marginLeft: computed.marginLeft,
      paddingTop: computed.paddingTop,
      paddingRight: computed.paddingRight,
      paddingBottom: computed.paddingBottom,
      paddingLeft: computed.paddingLeft,
      width: computed.width,
      height: computed.height,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      borderRadius: computed.borderRadius,
    };
  }

  // Check if element should be ignored
  function shouldIgnoreElement(element) {
    if (!element || element.nodeType !== 1) return true;
    const ignoreTags = ['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'HTML', 'NOSCRIPT'];
    if (ignoreTags.includes(element.tagName)) return true;
    if (element.closest('[data-ve-overlay]')) return true;
    const computed = window.getComputedStyle(element);
    if (computed.display === 'none' || computed.visibility === 'hidden') return true;
    return false;
  }

  // Get element info for parent
  function getElementInfo(element) {
    if (shouldIgnoreElement(element)) return null;
    
    const id = generateElementId(element);
    const rect = element.getBoundingClientRect();
    const sourceFile = element.getAttribute('data-ve-file');
    const sourceLine = element.getAttribute('data-ve-line');
    
    // Get only the FIRST direct text node content to prevent duplication
    let textContent = '';
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        textContent = node.textContent.trim();
        break;
      }
    }
    
    return {
      id,
      tagName: element.tagName,
      textContent: textContent,
      className: element.className || '',
      computedStyles: getComputedStyleInfo(element),
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      sourceFile: sourceFile || undefined,
      sourceLine: sourceLine ? parseInt(sourceLine, 10) : undefined,
    };
  }

  // Send message to parent with origin check
  function sendToParent(message) {
    try {
      window.parent.postMessage(message, '*');
    } catch (e) {
      console.warn('[VE-Client] Failed to send message:', e);
    }
  }

  // Create overlay element
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-ve-overlay', 'true');
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:999999;box-sizing:border-box;transition:all 0.1s ease;';
    document.body.appendChild(overlay);
    return overlay;
  }

  // Update overlay position and style
  function updateOverlay(overlay, rect, type) {
    if (!overlay) return;
    const isHover = type === 'hover';
    const color = isHover ? 'rgba(59,130,246,0.5)' : 'rgba(37,99,235,0.7)';
    const bg = isHover ? 'rgba(59,130,246,0.05)' : 'rgba(37,99,235,0.05)';
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:999999;box-sizing:border-box;' +
      'top:' + rect.top + 'px;left:' + rect.left + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;' +
      'border:2px solid ' + color + ';background:' + bg + ';transition:all 0.1s ease;';
  }

  // Remove overlay
  function removeOverlay(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  // Find element by ID
  function findElementById(id) {
    return document.querySelector('[data-ve-id="' + id + '"]');
  }

  // Clear all selections
  function clearSelection() {
    selectedElements.clear();
    selectionOverlays.forEach(removeOverlay);
    selectionOverlays.clear();
  }

  // Event Handlers
  function handleMouseMove(e) {
    if (!isEnabled) return;
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || shouldIgnoreElement(element)) {
      if (hoveredElement) {
        hoveredElement = null;
        removeOverlay(hoverOverlay);
        hoverOverlay = null;
        sendToParent({ type: 'ELEMENT_HOVERED', payload: { element: null } });
      }
      return;
    }
    
    const elementId = generateElementId(element);
    if (hoveredElement !== element && !selectedElements.has(elementId)) {
      hoveredElement = element;
      if (!hoverOverlay) hoverOverlay = createOverlay();
      updateOverlay(hoverOverlay, element.getBoundingClientRect(), 'hover');
      sendToParent({ type: 'ELEMENT_HOVERED', payload: { element: getElementInfo(element) } });
    }
  }

  function handleClick(e) {
    if (!isEnabled) return;
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || shouldIgnoreElement(element)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const elementId = generateElementId(element);
    const isMultiSelect = e.ctrlKey || e.metaKey;
    
    if (isMultiSelect) {
      if (selectedElements.has(elementId)) {
        selectedElements.delete(elementId);
        removeOverlay(selectionOverlays.get(elementId));
        selectionOverlays.delete(elementId);
        sendToParent({ type: 'ELEMENT_DESELECTED', payload: { elementId } });
      } else {
        selectedElements.set(elementId, element);
        const overlay = createOverlay();
        selectionOverlays.set(elementId, overlay);
        updateOverlay(overlay, element.getBoundingClientRect(), 'selected');
        sendToParent({ type: 'ELEMENT_SELECTED', payload: { elements: [getElementInfo(element)], isMultiSelect: true } });
      }
    } else {
      clearSelection();
      selectedElements.set(elementId, element);
      const overlay = createOverlay();
      selectionOverlays.set(elementId, overlay);
      updateOverlay(overlay, element.getBoundingClientRect(), 'selected');
      sendToParent({ type: 'ELEMENT_SELECTED', payload: { elements: [getElementInfo(element)], isMultiSelect: false } });
    }
    
    if (hoverOverlay) { removeOverlay(hoverOverlay); hoverOverlay = null; }
    hoveredElement = null;
  }

  function handleKeyDown(e) {
    if (!isEnabled) return;
    if (e.key === 'Escape') {
      clearSelection();
      sendToParent({ type: 'CLEAR_SELECTION', payload: {} });
    }
  }

  function handleScroll() {
    selectionOverlays.forEach(function(overlay, elementId) {
      const element = findElementById(elementId);
      if (element) updateOverlay(overlay, element.getBoundingClientRect(), 'selected');
    });
    if (hoverOverlay && hoveredElement) {
      updateOverlay(hoverOverlay, hoveredElement.getBoundingClientRect(), 'hover');
    }
  }

  // Load a Google Font dynamically
  function loadGoogleFont(fontFamily) {
    // Skip system fonts
    var systemFonts = ['system-ui', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Tahoma', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'sans-serif', 'serif', 'monospace'];
    if (systemFonts.some(function(sf) { return fontFamily.toLowerCase().includes(sf.toLowerCase()); })) {
      return;
    }
    
    // Clean font name (remove fallbacks like "Inter, sans-serif")
    var cleanFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    if (!cleanFont) return;
    
    // Check if already loaded
    var fontId = 'google-font-' + cleanFont.replace(/\s+/g, '-').toLowerCase();
    if (document.getElementById(fontId)) {
      console.log('[VE-Client] Font already loaded:', cleanFont);
      return;
    }
    
    // Create link element
    var link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(cleanFont) + ':wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
    console.log('[VE-Client] Loaded Google Font:', cleanFont);
  }

  // Apply style changes from parent
  function applyStyleChanges(elementId, changes) {
    const element = findElementById(elementId);
    if (!element) return false;
    changes.forEach(function(change) {
      const prop = change.property.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      // If it's a font-family change, load the Google Font first
      if (prop === 'font-family') {
        loadGoogleFont(change.newValue);
      }
      
      element.style.setProperty(prop, change.newValue);
    });
    const overlay = selectionOverlays.get(elementId);
    if (overlay) updateOverlay(overlay, element.getBoundingClientRect(), 'selected');
    sendToParent({ type: 'STYLE_APPLIED', payload: { elementId, success: true } });
    return true;
  }

  // Update text content from parent
  function updateTextContent(elementId, text) {
    const element = findElementById(elementId);
    if (!element) return false;
    
    // Find and update only the FIRST text node to prevent duplication
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = text;
        sendToParent({ type: 'TEXT_UPDATED', payload: { elementId, success: true } });
        return true;
      }
    }
    
    // If no text node exists, prepend one for elements with children
    if (element.children.length > 0) {
      element.insertBefore(document.createTextNode(text), element.firstChild);
      sendToParent({ type: 'TEXT_UPDATED', payload: { elementId, success: true } });
      return true;
    }
    
    // For simple elements with no children, set textContent directly
    element.textContent = text;
    sendToParent({ type: 'TEXT_UPDATED', payload: { elementId, success: true } });
    return true;
  }

  // Message handler
  function handleMessage(event) {
    // Security: Only allow messages from known origins
    if (!isAllowedOrigin(event.origin)) {
      return;
    }
    
    var message = event.data;
    if (!message || !message.type) return;
    
    switch (message.type) {
      case 'VISUAL_EDITOR_INIT':
      case 'VISUAL_EDITOR_TOGGLE':
        isEnabled = message.payload.enabled;
        if (!isEnabled) {
          clearSelection();
          if (hoverOverlay) { removeOverlay(hoverOverlay); hoverOverlay = null; }
          hoveredElement = null;
        }
        document.body.style.cursor = isEnabled ? 'crosshair' : '';
        sendToParent({ type: 'VISUAL_EDITOR_READY', payload: { enabled: isEnabled } });
        break;
      case 'CLEAR_SELECTION':
        clearSelection();
        break;
      case 'APPLY_STYLE':
        applyStyleChanges(message.payload.elementId, message.payload.changes);
        break;
      case 'UPDATE_TEXT':
        updateTextContent(message.payload.elementId, message.payload.text);
        break;
      case 'REQUEST_ELEMENT_INFO':
        var el = findElementById(message.payload.elementId);
        if (el) sendToParent({ type: 'ELEMENT_INFO_RESPONSE', payload: { element: getElementInfo(el) } });
        break;
      case 'APPLY_THEME_PREVIEW':
        console.log('[VE-Client] Received APPLY_THEME_PREVIEW message');
        applyThemePreview(message.payload.themeVars);
        break;
      case 'CLEAR_THEME_PREVIEW':
        console.log('[VE-Client] Received CLEAR_THEME_PREVIEW message');
        clearThemePreview();
        break;
      case 'DRAG_ELEMENT_START':
        console.log('[VE-Client] Received DRAG_ELEMENT_START message');
        startDragMode(message.payload.elementType, message.payload.content);
        break;
      case 'DRAG_ELEMENT_END':
        console.log('[VE-Client] Received DRAG_ELEMENT_END message');
        endDragMode();
        break;
      case 'INSERT_ELEMENT':
        console.log('[VE-Client] Received INSERT_ELEMENT message');
        insertElement(message.payload.content, message.payload.targetElementId, message.payload.position);
        break;
    }
  }

  // Apply theme preview - set CSS variables directly on :root (like thmeswitcher.html)
  function applyThemePreview(themeVars) {
    console.log('[VE-Client] applyThemePreview called with vars:', themeVars ? Object.keys(themeVars).length + ' variables' : 'null');
    
    if (!themeVars || typeof themeVars !== 'object') {
      console.warn('[VE-Client] No theme variables provided');
      return;
    }
    
    // Apply CSS variables directly to :root using setProperty (same as thmeswitcher.html)
    var root = document.documentElement;
    var appliedCount = 0;
    var backgroundValue = null;
    
    Object.entries(themeVars).forEach(function(entry) {
      var key = entry[0];
      var value = entry[1];
      root.style.setProperty(key, value);
      appliedCount++;
      
      // Track background for direct application
      if (key === '--background') {
        backgroundValue = value;
      }
      
      // Log first few for debugging
      if (appliedCount <= 5) {
        console.log('[VE-Client] Set', key, '=', value);
      }
    });
    
    // Also apply background directly to body as fallback for apps that don't use CSS variables
    if (backgroundValue) {
      document.body.style.backgroundColor = 'hsl(' + backgroundValue + ')';
      console.log('[VE-Client] Also set body background to:', 'hsl(' + backgroundValue + ')');
    }
    
    // Verify the variables were set
    var testVar = root.style.getPropertyValue('--background');
    console.log('[VE-Client] Verification: --background =', testVar);
    console.log('[VE-Client] Root style attribute length:', root.getAttribute('style') ? root.getAttribute('style').length : 0);
    
    console.log('[VE-Client] Theme preview applied via setProperty,', appliedCount, 'CSS variables set');
    sendToParent({ type: 'THEME_PREVIEW_APPLIED', payload: { success: true, varsCount: appliedCount } });
  }

  // Clear theme preview - remove CSS variables from :root
  function clearThemePreview() {
    var root = document.documentElement;
    var computedStyle = window.getComputedStyle(root);
    var propsToRemove = [];
    
    // Collect all CSS custom properties
    for (var i = 0; i < root.style.length; i++) {
      var prop = root.style[i];
      if (prop.startsWith('--')) {
        propsToRemove.push(prop);
      }
    }
    
    // Remove them
    propsToRemove.forEach(function(prop) {
      root.style.removeProperty(prop);
    });
    
    console.log('[VE-Client] Theme preview cleared, removed', propsToRemove.length, 'CSS variables');
    sendToParent({ type: 'THEME_PREVIEW_CLEARED', payload: { success: true } });
  }

  // ============================================
  // DRAG AND DROP FUNCTIONS
  // ============================================
  var isDraggingElement = false;
  var dragElementType = null;
  var dragElementContent = null;
  var dropTargetOverlay = null;
  var currentDropTarget = null;
  var dropPosition = 'inside';

  function startDragMode(elementType, content) {
    isDraggingElement = true;
    dragElementType = elementType;
    dragElementContent = content;
    document.body.style.cursor = 'copy';
    
    // Create drop target overlay
    if (!dropTargetOverlay) {
      dropTargetOverlay = document.createElement('div');
      dropTargetOverlay.setAttribute('data-ve-overlay', 'true');
      dropTargetOverlay.id = 've-drop-overlay';
      dropTargetOverlay.style.cssText = 'position: fixed; pointer-events: none; z-index: 999998; box-sizing: border-box; border: 2px dashed #22c55e; background: rgba(34, 197, 94, 0.1); display: none;';
      document.body.appendChild(dropTargetOverlay);
    }
    
    // Add drag-specific event listeners
    document.addEventListener('mousemove', handleDragMove, true);
    document.addEventListener('click', handleDrop, true);
    document.addEventListener('keydown', handleDragKeyDown, true);
    
    console.log('[VE-Client] Drag mode started:', elementType);
    sendToParent({ type: 'DRAG_MODE_STARTED', payload: { elementType: elementType } });
  }

  function endDragMode() {
    isDraggingElement = false;
    dragElementType = null;
    dragElementContent = null;
    currentDropTarget = null;
    document.body.style.cursor = isEnabled ? 'crosshair' : '';
    
    // Hide drop overlay
    if (dropTargetOverlay) {
      dropTargetOverlay.style.display = 'none';
    }
    
    // Remove drag event listeners
    document.removeEventListener('mousemove', handleDragMove, true);
    document.removeEventListener('click', handleDrop, true);
    document.removeEventListener('keydown', handleDragKeyDown, true);
    
    console.log('[VE-Client] Drag mode ended');
  }

  function handleDragMove(event) {
    if (!isDraggingElement) return;
    
    var target = document.elementFromPoint(event.clientX, event.clientY);
    if (!target || shouldIgnoreElement(target)) {
      if (dropTargetOverlay) dropTargetOverlay.style.display = 'none';
      currentDropTarget = null;
      return;
    }
    
    // Find valid drop container
    var foundDropTarget = findDropTarget(target);
    if (!foundDropTarget) {
      if (dropTargetOverlay) dropTargetOverlay.style.display = 'none';
      currentDropTarget = null;
      return;
    }
    
    currentDropTarget = foundDropTarget;
    
    // Determine drop position based on mouse position
    var rect = foundDropTarget.getBoundingClientRect();
    var mouseY = event.clientY;
    var relativeY = (mouseY - rect.top) / rect.height;
    
    if (relativeY < 0.25) {
      dropPosition = 'before';
    } else if (relativeY > 0.75) {
      dropPosition = 'after';
    } else {
      dropPosition = 'inside';
    }
    
    // Update drop overlay
    if (dropTargetOverlay) {
      dropTargetOverlay.style.display = 'block';
      
      if (dropPosition === 'before') {
        dropTargetOverlay.style.left = rect.left + 'px';
        dropTargetOverlay.style.top = (rect.top - 2) + 'px';
        dropTargetOverlay.style.width = rect.width + 'px';
        dropTargetOverlay.style.height = '4px';
        dropTargetOverlay.style.background = '#22c55e';
        dropTargetOverlay.style.border = 'none';
      } else if (dropPosition === 'after') {
        dropTargetOverlay.style.left = rect.left + 'px';
        dropTargetOverlay.style.top = (rect.bottom - 2) + 'px';
        dropTargetOverlay.style.width = rect.width + 'px';
        dropTargetOverlay.style.height = '4px';
        dropTargetOverlay.style.background = '#22c55e';
        dropTargetOverlay.style.border = 'none';
      } else {
        dropTargetOverlay.style.left = rect.left + 'px';
        dropTargetOverlay.style.top = rect.top + 'px';
        dropTargetOverlay.style.width = rect.width + 'px';
        dropTargetOverlay.style.height = rect.height + 'px';
        dropTargetOverlay.style.background = 'rgba(34, 197, 94, 0.1)';
        dropTargetOverlay.style.border = '2px dashed #22c55e';
      }
    }
  }

  function findDropTarget(element) {
    var validContainers = ['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'HEADER', 'FOOTER', 'NAV', 'FORM', 'UL', 'OL', 'BODY'];
    
    var current = element;
    while (current && current !== document.body) {
      if (validContainers.indexOf(current.tagName) !== -1 && !current.hasAttribute('data-ve-overlay')) {
        return current;
      }
      current = current.parentElement;
    }
    
    return document.body;
  }

  function handleDrop(event) {
    if (!isDraggingElement || !currentDropTarget || !dragElementContent) {
      endDragMode();
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    // Parse the JSX content and create HTML element
    var htmlContent = jsxToHtml(dragElementContent);
    
    // Create a temporary container to parse the HTML
    var temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    var newElement = temp.firstElementChild;
    
    if (!newElement) {
      console.warn('[VE-Client] Failed to create element');
      endDragMode();
      return;
    }
    
    // Generate unique ID for the new element
    var elementId = 've-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    newElement.setAttribute('data-ve-id', elementId);
    
    // Insert element based on position
    if (dropPosition === 'before') {
      currentDropTarget.parentNode.insertBefore(newElement, currentDropTarget);
    } else if (dropPosition === 'after') {
      currentDropTarget.parentNode.insertBefore(newElement, currentDropTarget.nextSibling);
    } else {
      currentDropTarget.appendChild(newElement);
    }
    
    // Notify parent about the insertion
    sendToParent({
      type: 'ELEMENT_INSERTED',
      payload: {
        elementId: elementId,
        content: dragElementContent,
        position: dropPosition,
        parentTag: currentDropTarget.tagName
      }
    });
    
    console.log('[VE-Client] Element inserted:', elementId, 'position:', dropPosition);
    
    endDragMode();
  }

  function handleDragKeyDown(event) {
    if (event.key === 'Escape') {
      endDragMode();
      sendToParent({ type: 'DRAG_CANCELLED', payload: {} });
    }
  }

  function jsxToHtml(jsx) {
    if (!jsx) return '';
    
    return jsx
      .replace(/className=/g, 'class=')
      .replace(/htmlFor=/g, 'for=')
      .replace(/\{[^}]*\}/g, '')
      .replace(/<(\w+)([^>]*)\/>/g, '<$1$2></$1>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function insertElement(content, targetElementId, position) {
    var target = targetElementId ? findElementById(targetElementId) : document.body;
    if (!target) {
      target = document.body;
    }
    
    var htmlContent = jsxToHtml(content);
    var temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    var newElement = temp.firstElementChild;
    
    if (!newElement) {
      console.warn('[VE-Client] Failed to create element for insertion');
      return;
    }
    
    var elementId = 've-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    newElement.setAttribute('data-ve-id', elementId);
    
    if (position === 'before') {
      target.parentNode.insertBefore(newElement, target);
    } else if (position === 'after') {
      target.parentNode.insertBefore(newElement, target.nextSibling);
    } else {
      target.appendChild(newElement);
    }
    
    sendToParent({
      type: 'ELEMENT_INSERTED',
      payload: {
        elementId: elementId,
        content: content,
        position: position || 'inside'
      }
    });
    
    console.log('[VE-Client] Element inserted via INSERT_ELEMENT:', elementId);
  }

  // Initialize
  function init() {
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    window.addEventListener('message', handleMessage);
    
    // Notify parent we're ready
    sendToParent({ type: 'VISUAL_EDITOR_READY', payload: {} });
    console.log('[VE-Client] Initialized - waiting for parent commands');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
