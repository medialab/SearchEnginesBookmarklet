(function(){
  var t = {
    //scriptUrl: "//localhost:4443/extract_google_results.js" // for debug using `node serve-https.js`
    scriptUrl: "//medialab.github.io/google-bookmarklets/extract_google_results.js"
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
    query = (~href.search(/[?&]q=/) ? href.replace(/^.*[?&]q=([^#?&]+).*$/, '$1') : undefined);
  if (!~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//))
    return window.alert("You can only use this bookmarklet on Google's classic search.");
  else if (!query)
    return window.alert("Please search for a keyword first.");
  if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(t), artoo.exec(), e = !1)), e){
    var bod = document.getElementsByTagName("body")[0];
    bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
    injectScript(bod, "//medialab.github.io/artoo/public/dist/artoo-latest.min.js", "artoo", t);
    injectScript(bod, "//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", "FileSaver");
  }
}).call(this);
