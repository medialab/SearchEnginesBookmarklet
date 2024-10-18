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
  }, injectScript = function(body, url, name, settings){
    var a = document.createElement("script");
    console.log("Loading "+name+".js...");
    a.src = url;
    a.type = "text/javascript";
    a.id = name + "_injected_script";
    if (settings) a.setAttribute("settings", JSON.stringify(settings));
    body.appendChild(a);
  }, e = !0,
    href = window.location.href,
    query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
  if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
    var query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    if(!query)
      return window.alert("Please search for a keyword first.");
    if (href.includes("num=") && href.includes("start=")){
      if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(s), artoo.exec(), e = !1)), e){
        var bod = document.getElementsByTagName("body")[0];
        bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
        injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", s);
      }
    } else {
      if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(t), artoo.exec(), e = !1)), e){
        var bod = document.getElementsByTagName("body")[0];
        bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
        injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", t);
      }
    }
  }
  else if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(d), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", d);
    }
  }
  else
    return window.alert("You can only use this bookmarklet on Google and DuckDuckGo websites.");
}).call(this);
