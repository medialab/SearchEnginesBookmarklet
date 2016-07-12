(function(){
  var loc = window.location,
    href = loc.href,
    query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
    hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&](hl=[^#?&]+).*$/, '&$1') : '&hl=fr'),
    total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 100),
    start = (~href.search(/start=/) ? parseInt(href.replace(/^.*[#?&]start=(\d+).*$/, '$1')) : 0),
    page = start/total,
    data = artoo.scrape("h3.r a", {"url": "href", "name": "text"});
  if (!~window.location.href.search(/:\/\/([^.]+\.)?google\.[^/]+\//))
    return window.alert("You can only use this bookmarklet on Google websites.");
  else if (!query)
    return window.alert("Please search for a keyword first.");
  artoo.log.verbose(data.length + " results for query '" + query + "' on page " + page);
  var blob = new Blob([artoo.writers.csv(data)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "google-results-"+query+"-"+page+".csv");
  setTimeout(function(){
    if (window.confirm("CSV downloaded with "+data.length+" results from page "+page+" of Google results for query "+ query + "\nDo you want to go to the next page?")) {
      window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + hlang + "&num=" + total + "&start=" + (start + total);
    }
  }, 350);
})();
