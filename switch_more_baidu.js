(function(){
    var loc = window.location,
      href = loc.href,
      query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined),
      pn = (~href.search(/pn=/) ? parseInt(href.replace(/^.*[#?&]pn=(\d+).*$/, '$1')) : 0),
      rn = (~href.search(/rn=/) ? parseInt(href.replace(/^.*[#?&]rn=(\d+).*$/, '$1')) : 50),
      results = [10, 20, 50],
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
        artoo.$('#BBMoverlay .BBMurl').val(loc.protocol + "//" + loc.hostname + "/s?wd=" + query + '&pn=' + pn + '&rn=' + artoo.$('#BBMoverlay .BBMresults').val());
      },
      styles = [
        '#BBMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
        '#BBMoverlay h2 {margin: 0px 0px 30px 0px; text-decoration: underline;}',
        '#BBMoverlay select {margin-left: 10px;}',
        '#BBMoverlay .GBMurl {width: 90%;}'
      ];
    artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
      '<div id="BBMoverlay">' +
        '<h2>Redirect to More Results Baidu</h2>' +
        '<p>How many results per page?' +
        '<select class="BBMresults"></select></p>' +
        '<p>You will be redirected to the following url:</p>' +
        '<textarea class="BBMurl" disabled="disabled" rows="3" />' +
        '<br/>' +
        '<input class="BBMredirect" type="button" value="Redirect me!"></input>' +
      '</div>');
    populateSelect('#BBMoverlay .BBMresults', results, rn);
    buildUrl();
    artoo.$('#BBMoverlay .BBMlang, #BBMoverlay .BBMresults').on('change', buildUrl);
    artoo.$("#BBMoverlay .BBMredirect").on('click', function(){
      window.location.href = artoo.$('#BBMoverlay .BBMurl').val();
    });
  })();
  