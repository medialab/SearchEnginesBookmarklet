(function(){
  var href = window.location.href,
    query = href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1'),
    total = (~href.search(/num=/) ? href.replace(/^.*[#?&]num=(\d+).*$/, '$1') : 100),
    start = (~href.search(/start=/) ? href.replace(/^.*[#?&](start=\d+).*$/, '&$1') : '');
  window.location.href = window.location.protocol + "//" + window.location.hostname + "/search?q=" + query + "&num=100" + start;
})();
