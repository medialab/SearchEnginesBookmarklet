(function(){
  var loc = window.location,
    href = loc.href,
    query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
    hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&]hl=([^#?&]+).*$/, '$1') : (($('html').lang) ? $('html').lang.substr(0,2) : 'fr')),
    total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 100),
    languages = ['en', 'fr', 'it', 'es', 'pt', 'de', 'nl', 'ru', 'ar', 'fa', 'zh', 'ja', 'ko'],
    results = [10, 20, 50, 100],
    populateSelect = function(selector, values, curVal){
      if (!~values.indexOf(curVal)) values.unshift(curVal);
      values.forEach(function(v) {
        var option = document.createElement('option');
        option.setAttribute('value', v);
        option.innerHTML = v;
        if (curVal === v) option.selected = 'selected';
        artoo.$(selector).append(option);
      });
    },
    buildUrl = function(){
      artoo.$('#GBMoverlay .GBMurl').val(loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&hl=' + artoo.$('#GBMoverlay .GBMlang').val() + '&num=' + artoo.$('#GBMoverlay .GBMresults').val() + '&start=0');
    },
    styles = [
      '#GBMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
      '#GBMoverlay h2 {margin: 0px 0px 30px 0px; text-decoration: underline;}',
      '#GBMoverlay select {margin-left: 10px;}',
      '#GBMoverlay .GBMurl {width: 90%;}'
    ];
  artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
    '<div id="GBMoverlay">' +
      '<h2>Redirect to Classic Google</h2>' +
      '<p>Which language?' +
      '<select class="GBMlang"></select></p>' +
      '<p>How many results per page?' +
      '<select class="GBMresults"></select></p>' +
      '<p>You will be redirected to the following url:</p>' +
      '<textarea class="GBMurl" disabled="disabled" rows="3" />' +
      '<br/>' +
      '<input class="GBMredirect" type="button" value="Redirect me!"></input>' +
    '</div>');
  populateSelect('#GBMoverlay .GBMlang', languages, hlang);
  populateSelect('#GBMoverlay .GBMresults', results, total);
  buildUrl();
  artoo.$('#GBMoverlay .GBMlang, #GBMoverlay .GBMresults').on('change', buildUrl);
  artoo.$("#GBMoverlay .GBMredirect").on('click', function(){
    window.location.href = artoo.$('#GBMoverlay .GBMurl').val();
  });
})();
