(function() {
  // Find current script tag to extract tenant ID and position
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  if (!currentScript) return;

  var tenantId = currentScript.getAttribute('data-tenant') || '00000000-0000-0000-0000-000000000000';
  var baseUrl = currentScript.src.substring(0, currentScript.src.lastIndexOf('/'));

  // Create container div
  var container = document.createElement('div');
  container.className = 'locksmith-quote-widget-container';
  container.style.width = '100%';
  container.style.maxWidth = '512px'; // Match max-w-lg from Tailwind (32rem)
  container.style.margin = '0 auto';
  container.style.borderRadius = '16px';
  container.style.overflow = 'hidden';
  container.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/widget?tenant=' + encodeURIComponent(tenantId);
  iframe.style.width = '100%';
  iframe.style.height = '620px'; // Initial height
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.scrolling = 'no';
  iframe.style.transition = 'height 0.2s ease-out';

  container.appendChild(iframe);

  // Insert container before the script tag
  currentScript.parentNode.insertBefore(container, currentScript);

  // Listen for resize messages from the iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'resize-widget') {
      iframe.style.height = event.data.height + 'px';
    }
  });
})();
