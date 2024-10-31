(function(){
  const scriptsDomain = "//medialab.github.io/google-bookmarklets/";
  // const scriptsDomain = "//localhost:4443/"; // for debug using `node serve-https.js`

  const moreResults = "switch_more_results.js",
    pagination = "extract_pagination_results.js",
    autoscroll = "extract_autoscroll_results.js";

  const href = window.location.href;
  var e = !0;

  const injectScriptWithArtoo = function(body, script){
    var a = document.createElement("script");
    console.log("Loading artoo.js...");
    a.src = "//medialab.github.io/artoo/public/dist/artoo-latest.min.js";
    a.type = "text/javascript";
    a.id = "artoo_injected_script";
    if (script)
      a.setAttribute("settings", JSON.stringify({scriptUrl: scriptsDomain + script}));
    body.appendChild(a);
  };

  const addPaginatedScraper = function(query, nResultsArg, startArg){
    if(!query)
      return window.alert("Please search for a keyword first.");
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings({scriptUrl: scriptsDomain + pagination}), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScriptWithArtoo(bod, href.includes(nResultsArg + "=") && href.includes(startArg + "=") ? pagination : moreResults);
    }
  };

  const addAutoscrollScraper = function(query){
    if (!query)
      return window.alert("Please search for a keyword first.");
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings({scriptUrl: scriptsDomain + autoscroll}), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScriptWithArtoo(bod, autoscroll);
    }
  };

  // Google
  if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    addPaginatedScraper(query, "num", "start");
  }

  // DuckDuckGo
  else if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    addAutoscrollScraper(query);
  }

  // Baidu
  else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
    const query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined);
    addPaginatedScraper(query, "rn", "pn");
  }

  // Qwant
  else if(~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    addAutoscrollScraper(query);
  }

  // Bing
  else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
    HTMLBodyElement.prototype.appendChild = Node.prototype.appendChild;
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    addPaginatedScraper(query, "q", "first");
  }

  else return window.alert("You can only use this bookmarklet on Google, DuckDuckGo, Baidu, Qwant and Bing.");
}).call(this);
