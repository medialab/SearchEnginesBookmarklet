(function(){
  var loc = window.location,
    href = loc.href,
    query = href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1'),
    hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&](hl=[^#?&]+).*$/, '&$1') : '&hl=fr'),
    total = (~href.search(/num=/) ? href.replace(/^.*[#?&](num=\d+).*$/, '&$1') : '&num=100'),
    start = (~href.search(/start=/) ? href.replace(/^.*[#?&](start=\d+).*$/, '&$1') : '');
  window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + hlang + total + start;
})();
