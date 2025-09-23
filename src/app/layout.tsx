import type { ReactNode } from "react";
import Script from "next/script";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Strip extension-injected attributes before React hydrates */}
        <Script id="sanitize-extension-attrs" strategy="beforeInteractive">
          {`
(function () {
  // Attributes known to be injected by some assistant/translator extensions
  var ATTRS = [
    'monica-id',
    'monica-version',
    'monica-translate-exclude-el',
    'data-listener-added_15559764'
  ];

  function cleanEl(el) {
    if (!el || !el.removeAttribute) return;
    for (var i = 0; i < ATTRS.length; i++) {
      try { el.removeAttribute(ATTRS[i]); } catch (_) {}
    }
  }

  function cleanTree() {
    try {
      cleanEl(document.body);
      var sel = ATTRS.map(function(a){ return '[' + a + ']'; }).join(',');
      var nodes = document.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) cleanEl(nodes[i]);
    } catch (_) {}
  }

  function onReady() {
    cleanTree();
    // If the extension mutates again, try to clean quickly after first change
    var once = false;
    try {
      var mo = new MutationObserver(function () {
        if (once) return;
        once = true;
        cleanTree();
        setTimeout(cleanTree, 0);
        setTimeout(cleanTree, 25);
      });
      mo.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
      // Stop observing after a short grace period to avoid overhead
      setTimeout(function(){ try{ mo.disconnect(); }catch(_){} }, 1500);
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();
          `}
        </Script>
      </head>
      {/* Also suppress hydration warnings at this node */}
      <body className="antialiased text-slate-700 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
