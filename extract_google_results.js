(function(){
  var href = window.location.href,
    query = href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1'),
    total = (~href.search(/num=/) ? href.replace(/^.*[#?&]num=(\d+).*$/, '$1') : 100),
    start = (~href.search(/start=/) ? href.replace(/^.*[#?&]start=(\d+).*$/, '$1') : 0),
    page = start/total,
    data = artoo.scrape("h3.r a", {"url": "href", "name": "text"});
  artoo.log.verbose(query, start, total, page, data.length);
  artoo.saveCsv(data, "google-results-"+query+"-"+page+".csv");
  if (window.confirm("CSV downloaded with "+total+" results from page "+page+" of Google results for query "+ query + "\nDo you want to go to the next page?")) {
    artoo.$(".b.navend a")[0].click()
  }
})();
