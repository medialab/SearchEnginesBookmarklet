(function(){
  const scriptsDomain = "//medialab.github.io/google-bookmarklets/";
  // const scriptsDomain = "//localhost:4443/"; // for debug using `node serve-https.js`

  if ("undefined" == typeof window.SearchEnginesBookmarklet) {
    window.alert("It seems you are using an old version of this tool.\n\nThe new version works with more search engines such as DuckDuckGo, Baidu, Bing and Qwant.\n\nPlease remove it from your bookmarks and reinstall it by visiting the page that will open in a new tab (first allow it to pop-up).");
    window.open("https://medialab.github.io/google-bookmarklets/");
  }

  const moreResults = "switch_more_results.js",
    pagination = "extract_pagination_results.js",
    autoscroll = "extract_autoscroll_results.js";

  const href = window.location.href;
  var e = !0;

  const injectScriptWithArtoo = function(body, script){
    if ("object" != typeof body) return;
    var a = document.createElement("script");
    console.log("Loading artoo.js...");
    a.src = "//medialab.github.io/artoo/public/dist/artoo-latest.min.js";
    a.type = "text/javascript";
    a.id = "artoo_injected_script";
    if (script) a.setAttribute("settings", JSON.stringify({scriptUrl: scriptsDomain + script}));
    body.appendChild(a);
  };

  const checkQuery = function(queryArg){
    const searchRegexp = new RegExp("[#?&]" + queryArg + "="),
      replaceRegexp = new RegExp("^.*[#?&]" + queryArg + "=([^#?&]+).*$"),
      query = (~href.search(searchRegexp) ? href.replace(replaceRegexp, '$1') : undefined);
    if (!query) return window.alert("Please input your search query first.");
    var bod = document.getElementsByTagName("body")[0];
    bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
    return bod;
  }

  const addPaginatedScraper = function(queryArg, nResultsArg, startArg){
    const bod = checkQuery(queryArg);
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings({scriptUrl: scriptsDomain + pagination}), artoo.exec(), e = !1)), e){
      injectScriptWithArtoo(bod, href.includes(nResultsArg + "=") && href.includes(startArg + "=") ? pagination : moreResults);
    }
  };

  const addAutoscrollScraper = function(queryArg){
    const bod = checkQuery(queryArg);
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings({scriptUrl: scriptsDomain + autoscroll}), artoo.exec(), e = !1)), e){
      injectScriptWithArtoo(bod, autoscroll);
    }
  };

  // Google
  if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
    addPaginatedScraper("q", "num", "start");
  }

  // DuckDuckGo
  else if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
    addAutoscrollScraper("q");
  }

  // Baidu
  else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
    addPaginatedScraper("wd", "rn", "pn");
  }

  // Qwant
  else if(~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//)){
    addAutoscrollScraper("q");
  }

  // Bing
  else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
    HTMLBodyElement.prototype.appendChild = Node.prototype.appendChild;
    addPaginatedScraper("q", "q", "first");
  }

  else window.alert("You can only use this bookmarklet on Google, DuckDuckGo, Baidu, Qwant and Bing.");
}).call(this);
