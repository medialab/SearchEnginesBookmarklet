(function(){
  var t = {
    // scriptUrl: "//localhost:4443/switch_classic_google.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/switch_classic_google.js"
  }, s = {
    // scriptUrl: "//localhost:4443/extract_google_results.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/extract_google_results.js"
  }, d = {
    // scriptUrl: "//localhost:4443/extract_duckduckgo_results.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/extract_duckduckgo_results.js"
  }, b = {
    // scriptUrl: "//localhost:4443/extract_baidu_results.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/extract_baidu_results.js"
  }, m = {
    // scriptUrl: "//localhost:4443/switch_more_baidu.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/switch_more_baidu.js"
  }, q = {
    // scriptUrl: "//localhost:4443/extract_qwant_results.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/extract_qwant_results.js"
  }, o = {
    // scriptUrl: "//localhost:4443/switch_more_bing.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/switch_more_bing.js"
  }, n = {
    // scriptUrl: "//localhost:4443/extract_bing_results.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/extract_bing_results.js"
  }, injectScript = function(body, url, name, settings){
    var a = document.createElement("script");
    console.log("Loading "+name+".js...");
    a.src = url;
    a.type = "text/javascript";
    a.id = name + "_injected_script";
    if (settings) a.setAttribute("settings", JSON.stringify(settings));
    body.appendChild(a);
  }, e = !0,
    href = window.location.href;
  if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    if(!query)
      return window.alert("Please search for a keyword first.");
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(s), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(
        bod,
        "//medialab.github.io/artoo/public/dist/artoo-latest.min.js",
        "artoo", 
        href.includes("num=") && href.includes("start=") ? s : t
      );
    }
  }
  else if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    if (!query)
      return window.alert("Please search for a keyword first.");
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(d), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", d);
    }
  }
  else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
    const query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined);
    if(!query)
      return window.alert("Please search for a keyword first."); 
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(b), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(
        bod,
        "//medialab.github.io/artoo/public/dist/artoo-latest.min.js",
        "artoo",
        href.includes("rn=") && href.includes("pn=") ? b : m
      );
    }
  }
  else if(~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    if (!query)
      return window.alert("Please search for a keyword first.");
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(q), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", q);
    }
  }
  else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
    HTMLBodyElement.prototype.appendChild = Node.prototype.appendChild;
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    if(!query)
      return window.alert("Please search for a keyword first."); 
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(n), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(
        bod,
        "//medialab.github.io/artoo/public/dist/artoo-latest.min.js",
        "artoo",
        href.includes("q=") && href.includes("first=") ? n : o
      );
    }
  }
  else
    return window.alert("You can only use this bookmarklet on Google, DuckDuckGo, Qwant and Baidu websites.");
}).call(this);
