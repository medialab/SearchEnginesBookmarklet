(function(){
  var loc = window.location,
    href = loc.href,
    query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
    hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&]hl=([^#?&]+).*$/, '$1') : 'fr'),
    total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 100),
    languages = ['en', 'fr', 'it', 'es', 'pt', 'de', 'nl', 'ru', 'ar', 'fa', 'zh', 'ja', 'ko'],
    results = [10, 20, 50, 100],
    styles = [
      '#overlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
      'h2 {margin: 0px 0px 30px 0px; text-decoration: underline;}',
      'select {margin-left: 10px;}',
      '#url {width: 90%;}'
    ],
    ui = new artoo.ui();
  ui.$().html('<style>' + styles.join('\n') + '</style>' +
              '<div id="overlay">' +
                '<h2>Redirect to Classic Google</h2>' +
                '<p>Which language?' +
                '<select id="lang"></select></p>' +
                '<p>How many results per page?' +
                '<select id="results"></select></p>' +
                '<p>You will be redirected to the following url:</p>' +
                '<textarea id="url" disabled="disabled" rows="3" />' +
                '<br/>' +
                '<input id="redirect" type="button" value="Redirect me!"></input>' +
              '</div>');
    ui.populateSelect = function(selector, values, curVal){
      if (!~values.indexOf(curVal)) values.unshift(curVal);
      values.forEach(function(v) {
        var option = document.createElement('option');
        option.setAttribute('value', v);
        option.innerHTML = v;
        if (curVal === v) option.selected = 'selected';
        ui.shadow.querySelector(selector).appendChild(option);
      });
    };
    ui.populateSelect('#lang', languages, hlang);
    ui.populateSelect('#results', results, total);
    ui.buildUrl = function(){
      ui.$('#url').val(loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&hl=' + ui.$('#lang').val() + '&num=' + ui.$('#results').val() + '&start=0');
    };
    ui.buildUrl();
    ui.$('#lang, #results').on('change', ui.buildUrl);
    ui.$("#redirect").on('click', function(){
      window.location.href = ui.$('#url').val();
    })
})();
