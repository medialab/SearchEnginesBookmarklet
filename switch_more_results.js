(function(){
    var loc = window.location,
        href = loc.href,
        populateSelect = function(selector, values, curVal){
            if (!~values.indexOf(curVal)) values.unshift(curVal);
            values.forEach(function(v) {
            var option = document.createElement('option');
            option.setAttribute('value', v);
            option.innerHTML = v;
            if (curVal === v) option.selected = 'selected';
            artoo.$(selector).append(option);
        })},
        styles = [
            '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
            '#BMoverlay h2 {margin: 0px 0px 30px 0px; text-decoration: underline;}',
            '#BMoverlay select {margin-left: 10px;}',
            '#BMoverlay .BMurl {width: 90%;}'
        ];
    artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
        '<div id="BMoverlay">' +
        '<h2>Redirect to More Results</h2>' +
        '<p>How many results per page?' +
        '<select class="BMresults"></select></p>');
    if (~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)) {
        artoo.$('#BMoverlay').append(
            '<p>Which language?' +
            '<select class="BMlang"></select></p>');
    };
    artoo.$('#BMoverlay').append(
        '<p>You will be redirected to the following url:</p>' +
        '<textarea class="BMurl" disabled="disabled" rows="3" />' +
        '<br/>' +
        '<input class="BMredirect" type="button" value="Redirect me!"></input>' +
        '</div>'
    );
    if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
        var query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
        hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&]hl=([^#?&]+).*$/, '$1') : (($('html').lang) ? $('html').lang.substr(0,2) : 'fr')),
        total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 100),
        languages = ['en', 'fr', 'it', 'es', 'pt', 'de', 'nl', 'ru', 'ar', 'fa', 'zh', 'ja', 'ko'],
        results = [10, 20, 50, 100],
        buildUrl = function(){
            artoo.$('#BMoverlay .BMurl').val(loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&hl=' + artoo.$('#BMoverlay .BMlang').val() + '&num=' + artoo.$('#BMoverlay .BMresults').val() + '&start=0');
        };
        populateSelect('#BMoverlay .BMlang', languages, hlang);
        populateSelect('#BMoverlay .BMresults', results, total);
    }
    else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
        var query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined),
            pn = (~href.search(/pn=/) ? parseInt(href.replace(/^.*[#?&]pn=(\d+).*$/, '$1')) : 0),
            rn = (~href.search(/rn=/) ? parseInt(href.replace(/^.*[#?&]rn=(\d+).*$/, '$1')) : 50),
            results = [10, 20, 50],
            buildUrl = function(){
                artoo.$('#BMoverlay .BMurl').val(loc.protocol + "//" + loc.hostname + "/s?wd=" + query + '&pn=' + pn + '&rn=' + artoo.$('#BMoverlay .BMresults').val());
              };
        populateSelect('#BMoverlay .BMresults', results, rn);
    }
    else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
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
  