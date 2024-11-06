(function(){
  const scriptsDomain = "//medialab.github.io/SearchEnginesBookmarklet/";
  // const scriptsDomain = "//localhost:4443/"; // for debug using `node serve-https.js`

  if (window.artoo !== undefined && document.getElementById("BMoverlay")) return;

  if (window.SearchEnginesBookmarklet === undefined) {
    window.alert("It seems you are using an old version of this tool.\n\nThe new version works with more search engines such as DuckDuckGo, Baidu, Bing and Qwant.\n\nPlease remove it from your bookmarks and reinstall it by visiting the page that will open in a new tab (first allow it to pop-up).");
    window.open("https://medialab.github.io/SearchEnginesBookmarklet/");
  }

  const moreResults = "switch_more_results.js",
    pagination = "extract_pagination_results.js",
    autoscroll = "extract_autoscroll_results.js";

  const href = window.location.href;

  const injectScriptWithArtoo = function(queryArg, script){
    const searchRegexp = new RegExp("[#?&]" + queryArg + "="),
      replaceRegexp = new RegExp("^.*[#?&]" + queryArg + "=([^#?&]+).*$"),
      query = (~href.search(searchRegexp) ? href.replace(replaceRegexp, '$1') : undefined);
    if (!query) return window.alert("Please input your search query first.");

    var body = document.getElementsByTagName("body")[0];
    if (!body) {
      body = document.createElement("body");
      document.documentElement.appendChild(body);
    }
    if (typeof body !== "object") return;

    var a = document.createElement("script");
    console.log("Loading artoo.js...");
    a.src = "//medialab.github.io/artoo/public/dist/artoo-latest.min.js";
    a.type = "text/javascript";
    a.id = "artoo_injected_script";
    if (script) a.setAttribute("settings", JSON.stringify({scriptUrl: scriptsDomain + script}));
    body.appendChild(a);
  };

  // Google
  if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
    injectScriptWithArtoo("q", href.includes("num=") && href.includes("start=") ? pagination : moreResults);
  }

  // DuckDuckGo
  else if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
    injectScriptWithArtoo("q", autoscroll);
  }

  // Baidu
  else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
    injectScriptWithArtoo("wd", href.includes("rn=") && href.includes("pn=") ? pagination : moreResults);
  }

  // Qwant
  else if(~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//)){
    injectScriptWithArtoo("q", autoscroll);
  }

  // Bing
  else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
    HTMLBodyElement.prototype.appendChild = Node.prototype.appendChild;
    injectScriptWithArtoo("q", href.includes("q=") && href.includes("first=") ? pagination : moreResults);
  }

  else window.alert("You can only use this bookmarklet on Google, DuckDuckGo, Baidu, Qwant and Bing.");
}).call(this);
