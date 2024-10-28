(function(){
  const scriptsDomain = "//medialab.github.io/google-bookmarklets/";
  // const scriptsDomain = "//localhost:4443/"; // for debug using `node serve-https.js`
  const s = {
    scriptUrl: scriptsDomain + "extract_google_results.js"
  }, b = {
    scriptUrl: scriptsDomain + "extract_baidu_results.js"
  }, n = {
    scriptUrl: scriptsDomain + "extract_bing_results.js"
  }, more = {
    scriptUrl: scriptsDomain + "switch_more_results.js"
  }, autoscroll = {
    scriptUrl: scriptsDomain + "extract_autoscroll_results.js"
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
        href.includes("num=") && href.includes("start=") ? s : more
      );
    }
  }
  else if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    if (!query)
      return window.alert("Please search for a keyword first.");
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(autoscroll), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", autoscroll);
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
        href.includes("rn=") && href.includes("pn=") ? b : more
      );
    }
  }
  else if(~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//)){
    const query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
    if (!query)
      return window.alert("Please search for a keyword first.");
    if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(autoscroll), artoo.exec(), e = !1)), e){
      var bod = document.getElementsByTagName("body")[0];
      bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
      injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", autoscroll);
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
        href.includes("q=") && href.includes("first=") ? n : more
      );
    }
  }
  else
    return window.alert("You can only use this bookmarklet on Google, DuckDuckGo, Qwant, Bing and Baidu websites.");
}).call(this);
