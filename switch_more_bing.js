(function(){
    console.log(window.location.href);
    var loc = window.location,
      href = loc.href,
      query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
      count = (~href.search(/count=/) ? parseInt(href.replace(/^.*[#?&]count=(\d+).*$/, '$1')) : 30),
      first = (~href.search(/first=/) ? parseInt(href.replace(/^.*[#?&]first=(\d+).*$/, '$1')) : 0),
      form = (~href.search(/FORM=PERE/) ? parseInt(href.replace(/^.*[#?&]FORM=PERE(\d+).*$/, '$1')) : ""),
      results = [10, 20, 30],
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
        artoo.$('#BBMoverlay .BBMurl').val(loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&first=' + first + '&count=' + artoo.$('#BBMoverlay .BBMresults').val() + '&FORM=PERE' + form);
      },
      styles = [
        '#BBMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
        '#BBMoverlay h2 {margin: 0px 0px 30px 0px; text-decoration: underline;}',
        '#BBMoverlay select {margin-left: 10px;}',
        '#BBMoverlay .GBMurl {width: 90%;}'
      ];
    var bingOverride = HTMLBodyElement.prototype.appendChild;
    HTMLBodyElement.prototype.appendChild = Node.prototype.appendChild;

    artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
      '<div id="BBMoverlay">' +
        '<h2>Redirect to More Results Bing</h2>' +
        '<p>How many results per page?' +
        '<select class="BBMresults"></select></p>' +
        '<p>You will be redirected to the following url:</p>' +
        '<textarea class="BBMurl" disabled="disabled" rows="3" />' +
        '<br/>' +
        '<input class="BBMredirect" type="button" value="Redirect me!"></input>' +
      '</div>');
    populateSelect('#BBMoverlay .BBMresults', results, count);
    buildUrl();
    artoo.$('#BBMoverlay .BBMlang, #BBMoverlay .BBMresults').on('change', buildUrl);
    artoo.$("#BBMoverlay .BBMredirect").on('click', function(){
      window.location.href = artoo.$('#BBMoverlay .BBMurl').val();
    });
    HTMLBodyElement.prototype.appendChild = bingOverride;
  })();
  