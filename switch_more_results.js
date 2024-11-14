(function(){
  var loc = window.location,
    href = loc.href,
    search,
    styles = [
      '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; width: 400px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 15px; text-align: center; color: black; font-family: monospace; box-sizing: content-box; text-rendering: geometricprecision;}',
      '#BMoverlay h1 {display: block; font-size: 23px; font-weight: bold; margin: 0px 70px 15px 0px; padding: 0; line-height: 22px; text-decoration: underline; font-family: monospace; box-sizing: content-box;}',
      '#BMoverlay #BMlogo {position: absolute; top: 8px; right: 8px; width: 64px; height: 64px;}',
      '#BMoverlay h2 {display: block; font-size: 17px; font-weight: bold; margin: 0px 70px 25px 0px; padding: 0; line-height: 22px; font-family: monospace;}',
      '#BMoverlay p {display: block; font-size: 14px; font-family: monospace; margin: 12px 0; padding: 0; line-height: 16px;}',
      '#BMoverlay select {margin: 0 0 0 10px; padding: 0 5px; height: 20px; color: unset; border: 1px solid #555; border-radius: 2px; background-color: #EEE; font-family: monospace;}',
      '#BMoverlay .BMurl {width: 95%; font-family: monospace; font-size: 12px;}',
      '#BMoverlay .BMredirect {font-size: 14px; font-family: monospace; padding: 5px 10px; font-weight: bold; border: 1px solid #555; border-radius: 2px; background-color: #EEE;}',
      '#BMoverlay #BMfooter {margin: 15px 0 0 0; font-size: 10px; color: #555;}',
      '#BMoverlay #BMfooter a, #BMoverlay #BMfooter a:visited {color: black; text-decoration: underline; color: #555;}'
    ];

  const populateSelect = function(selector, values, curVal){
    if (!~values.indexOf(curVal)) values.unshift(curVal);
    values.forEach(function(v) {
      var option = document.createElement('option');
      option.setAttribute('value', v);
      option.innerHTML = v;
      if (curVal === v) option.selected = 'selected';
      artoo.$(selector).append(option);
    });
  };

  if (~href.search(/:\/\/([^.]+\.)?scholar\.google\.[^/]+\//)) {
    search = 'Scholar';
  } else if (~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)) {
    search = 'Google';
  } else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)) {
    search = 'Baidu';
  } else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)) {
    search = 'Bing';
  }

  // In-page popup injection
  artoo.$('body').append(
    '<style>' + styles.join('\n') + '</style>' +
    '<div id="BMoverlay">' +
      '<h1>SearchEngineBookmarklets</h1>' +
      '<img id="BMlogo" src="https://medialab.github.io/SearchEnginesBookmarklet/images/duckduckgo-google-bing-baidu-256.png" alt="SEB logo" />' +
      '<h2>Access ' + search + ' with more results</h2>' +
      '<p>How many results per page?' +
        '<select class="BMresults"></select>' +
      '</p>' +
      (search === 'Google' || search === 'Scholar'
      ? '<p>Which language?' +
           '<select class="BMlang"></select>' +
        '</p>'
      : '') +
      '<p>You will be redirected to the following url:</p>' +
      '<textarea class="BMurl" disabled="disabled" rows="2" />' +
      '<p>Use again SearchEnginesBookmarklet then from that page in order to extract its results.</p>' +
      '<input class="BMredirect" type="button" value="Redirect me!"></input>' +
      '<p id="BMfooter">Powered by <a target="_blank" href="https://medialab.sciencespo.fr/">médialab Sciences Po</a> &ndash; Discover more <a target="_blank" href="https://medialab.sciencespo.fr/en/tools/">médialab tools</a>!</p>' +
    '</div>'
  );

  // Google and Scholar Google
  if (search === 'Google' || search === 'Scholar') {
    var query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
      hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&]hl=([^#?&]+).*$/, '$1') : (($('html').lang) ? $('html').lang.replace(/-.*$/, '') : 'fr')),
      total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : search === 'Google' ? 100 : 20),
      languages = ['en', 'fr', 'it', 'es', 'pt', 'de', 'nl', 'ru', 'ar', 'fa', 'zh', 'ja', 'ko'],
      results = search === 'Google' ? [10, 20, 50, 100] : [10, 20],
      buildUrl = function(){
        artoo.$('#BMoverlay .BMurl').val(loc.protocol + "//" + loc.hostname + "/" + (search === 'Google' ? 'search' : 'scholar') + '?q=' + query + '&hl=' + artoo.$('#BMoverlay .BMlang').val() + '&num=' + artoo.$('#BMoverlay .BMresults').val() + '&start=0');
      };
    populateSelect('#BMoverlay .BMlang', languages, hlang);
    populateSelect('#BMoverlay .BMresults', results, total);

  // Baidu
  } else if (search === 'Baidu') {
    var query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined),
      rn = (~href.search(/rn=/) ? parseInt(href.replace(/^.*[#?&]rn=(\d+).*$/, '$1')) : 50),
      pn = (~href.search(/pn=/) ? parseInt(href.replace(/^.*[#?&]pn=(\d+).*$/, '$1')) : 0),
      results = [10, 20, 50],
      buildUrl = function(){
        artoo.$('#BMoverlay .BMurl').val(loc.protocol + "//" + loc.hostname + "/s?wd=" + query + '&pn=' + pn + '&rn=' + artoo.$('#BMoverlay .BMresults').val());
      };
    populateSelect('#BMoverlay .BMresults', results, rn);

  // Bing
  } else if (search === 'Bing') {
    var query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
      count = (~href.search(/count=/) ? parseInt(href.replace(/^.*[#?&]count=(\d+).*$/, '$1')) : 30),
      first = (~href.search(/first=/) ? parseInt(href.replace(/^.*[#?&]first=(\d+).*$/, '$1')) : 0),
      form = (~href.search(/FORM=PERE/) ? parseInt(href.replace(/^.*[#?&]FORM=PERE(\d+).*$/, '$1')) : ""),
      results = [10, 20, 30],
      buildUrl = function(){
        artoo.$('#BMoverlay .BMurl').val(loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&first=' + first + '&count=' + artoo.$('#BMoverlay .BMresults').val() + '&FORM=PERE' + form);
      };
    populateSelect('#BMoverlay .BMresults', results, count);
    }

  buildUrl();

  artoo.$('#BMoverlay .BMlang, #BMoverlay .BMresults').on('change', buildUrl);
  artoo.$("#BMoverlay .BMredirect").on('click', function(){
    window.location.href = artoo.$('#BMoverlay .BMurl').val();
  });
})();
