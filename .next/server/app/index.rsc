1:"$Sreact.fragment"
2:I[8920,["177","static/chunks/app/layout-0f3c66514bf50dc0.js"],""]
4:I[204,[],""]
5:I[9162,[],""]
d:I[504,[],""]
3:T5b5,
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
          0:{"P":null,"b":"ik5NpbFjRwe-TIcQAeSlz","p":"","c":["",""],"i":false,"f":[[["",{"children":["__PAGE__",{}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[null,["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":["$","$L2",null,{"id":"sanitize-extension-attrs","strategy":"beforeInteractive","children":"$3"}]}],["$","body",null,{"className":"antialiased text-slate-700 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen","suppressHydrationWarning":true,"children":["$","$L4",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]]}]]}],{"children":["__PAGE__",["$","$1","c",{"children":[["$","main",null,{"className":"mx-auto max-w-7xl p-6 space-y-8 animate-fade-in","children":[["$","header",null,{"className":"flex items-center justify-between mb-8","children":[["$","div",null,{"className":"flex items-center space-x-4","children":[["$","div",null,{"className":"h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg","children":["$","svg",null,{"className":"h-6 w-6 text-white","fill":"none","stroke":"currentColor","viewBox":"0 0 24 24","children":[["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"}],"$L6"]}]}],"$L7"]}],"$L8"]}],"$L9","$La"]}],null,"$Lb"]}],{},null,false]},null,false],"$Lc",false]],"m":"$undefined","G":["$d",[]],"s":false,"S":true}
e:I[8298,["974","static/chunks/app/page-e9b9954822587fbf.js"],"default"]
f:I[6566,["974","static/chunks/app/page-e9b9954822587fbf.js"],"default"]
10:I[1582,["974","static/chunks/app/page-e9b9954822587fbf.js"],"default"]
11:I[5225,[],"OutletBoundary"]
13:I[6228,[],"AsyncMetadataOutlet"]
15:I[5225,[],"ViewportBoundary"]
17:I[5225,[],"MetadataBoundary"]
18:"$Sreact.suspense"
6:["$","path",null,{"strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":2,"d":"M15 11a3 3 0 11-6 0 3 3 0 016 0z"}]
7:["$","div",null,{"children":[["$","h1",null,{"className":"text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent","children":"Wialon Dashboard"}],["$","p",null,{"className":"text-slate-600 font-medium","children":"Real-time fleet monitoring & tracking"}]]}]
8:["$","div",null,{"className":"flex items-center space-x-2 text-sm text-slate-500","children":[["$","div",null,{"className":"h-2 w-2 bg-success-500 rounded-full animate-pulse-slow"}],["$","span",null,{"children":"Live"}]]}]
9:["$","section",null,{"className":"grid gap-6 lg:grid-cols-3","children":[["$","div",null,{"className":"lg:col-span-2 animate-slide-up","children":["$","$Le",null,{}]}],["$","div",null,{"className":"lg:col-span-1 animate-slide-up","style":{"animationDelay":"0.1s"},"children":["$","$Lf",null,{}]}]]}]
a:["$","div",null,{"className":"animate-slide-up","style":{"animationDelay":"0.2s"},"children":["$","$L10",null,{}]}]
b:["$","$L11",null,{"children":["$L12",["$","$L13",null,{"promise":"$@14"}]]}]
c:["$","$1","h",{"children":[null,[["$","$L15",null,{"children":"$L16"}],null],["$","$L17",null,{"children":["$","div",null,{"hidden":true,"children":["$","$18",null,{"fallback":null,"children":"$L19"}]}]}]]}]
16:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
12:null
1a:I[8588,[],"IconMark"]
14:{"metadata":[["$","link","0",{"rel":"icon","href":"/favicon.ico","type":"image/x-icon","sizes":"16x16"}],["$","$L1a","1",{}]],"error":null,"digest":"$undefined"}
19:"$14:metadata"
