(function(){
  var loc = window.location,
    href = loc.href,
    query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
    hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&](hl=[^#?&]+).*$/, '&$1') : '&hl=fr'),
    total = (~href.search(/num=/) ? href.replace(/^.*[#?&](num=\d+).*$/, '&$1') : '&num=100'),
    start = (~href.search(/start=/) ? href.replace(/^.*[#?&](start=\d+).*$/, '&$1') : '');
  if (!~window.location.href.search(/:\/\/([^.]+\.)?google\.[^/]+\//))
    return window.alert("You can only use this bookmarklet on Google websites.");
  else if (!query)
    return window.alert("Please search for a keyword first.");
  window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + hlang + total + start;
})();
