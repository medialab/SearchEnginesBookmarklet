(function(){
  var t = {
    //log: {beeping: true},
    scriptUrl: "//medialab.github.io/google-bookmarklets/extract_google_results.js"
  }, e = !0;
  if ("object" == typeof this.artoo && (artoo.settings.reload || (artoo.loadSettings(t), artoo.exec(), artoo.beep(), e = !1)), e){
    var bod = document.getElementsByTagName("body")[0];
    bod || (bod = document.createElement("body"), document.documentElement.appendChild(bod));
    var a = document.createElement("script");
    console.log("Loading artoo.js...");
    a.src = "//medialab.github.io/artoo/public/dist/artoo-latest.min.js";
    a.type = "text/javascript";
    a.id = "artoo_injected_script";
    a.setAttribute("settings", JSON.stringify(t));
    bod.appendChild(a);
    var b = document.createElement("script");
    console.log("Loading FileSaver.js...");
    b.src = "//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js";
    b.type = "text/javascript";
    b.id = "filesaver_injected_script";
    b.setAttribute("settings", JSON.stringify(t));
    bod.appendChild(b);
  }
}).call(this);
