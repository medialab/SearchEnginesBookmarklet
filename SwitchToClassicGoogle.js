(function(){
  var loc = window.location,
    href = loc.href,
    query = href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1'),
    total = (~href.search(/num=/) ? href.replace(/^.*[#?&]num=(\d+).*$/, '$1') : 100),
    start = (~href.search(/start=/) ? href.replace(/^.*[#?&](start=\d+).*$/, '&$1') : '');
  href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + "&num=" + total + start;
})();
