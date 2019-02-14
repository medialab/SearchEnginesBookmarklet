(function(){
  var loc = window.location,
    href = loc.href,
    query = href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1'),
    hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&]hl=([^#?&]+).*$/, '$1') : 'fr'),
    total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 100),
    start = (~href.search(/start=/) ? parseInt(href.replace(/^.*[#?&]start=(\d+).*$/, '$1')) : 0),
    page = start/total,
    storage = 'scrap-query',
    storageKey = query + '/' + hlang + '/' + total,
    url_index = 0,
    tmpidx = 0,
    pastdata, fulldata,
    newdata = artoo.scrape(".rc", {
      url: {
        sel: '.r a',
        attr: 'href'
      },
      name: {
        sel: '.r a h3',
        method: 'text'
      },
      row: {
        sel: '.r a.ab_button',
        method: function($){
          var el = $(this);
          if (el.length) {
            tmpidx = el.attr('id').replace(/am-b/, '');
            return tmpidx;
          }
          return tmpidx++;
        }
      },
      description: {
        sel: 'div.s span.st',
        method: function($){
          var linkdate = artoo.scrape($(this).find('span.f'), 'text'),
            wholedescr = $(this).text();
          if (linkdate) return wholedescr.replace(linkdate, '');
          return wholedescr;
        }
      },
      date: {
        sel: 'div.s span.st span.f',
        method: function($){
          return $(this).text().replace(/ - $/, '');
        }
      }
    }),
    styles = [
      '#GBMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
      '#GBMoverlay h2 {margin: 0px 0px 15px 0px; text-decoration: underline;}',
      '#GBMoverlay input[type="button"] {margin: 3px;}'
    ],
    initStore = function(){
      artoo.store.set(storage, storageKey);
      artoo.store.set(storage + '-pages', []);
      artoo.store.set(storage + '-data', []);
      pastdata = [];
      fulldata = newdata;
    };

  artoo.store.concatTo = function(key, arr) {
    artoo.store.set(key, artoo.store(key).concat(arr));
  }

  if (artoo.store(storage) !== storageKey) {
    initStore();
  } else {
    pastdata = artoo.store(storage + '-data') || [];
  }

  artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
    '<div id="GBMoverlay">' +
      '<h2>Extract Classic Google Results</h2>' +
      '<p>Search for "<b>' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>"<br/>' +
        'page ' + page + ' (with up to ' + total + ' urls per page)</p>' +
      '<p class="GBMpageresults"></p>' +
      '<p class="GBMoldresults"></p>' +
      '<input class="GBMcontinue" type="button" value="Keep existing results & continue to the next page"></input><br/>' +
      '<input class="GBMdownload" type="button"></input><br/>' +
      '<input class="GBMdownloadAll" type="button"></input>' +
      '<input class="GBMreset" type="button" value="Clear existing results from cache"></input>' +
    '</div>');

  var refresh = function(){
    var donepages = artoo.store(storage + '-pages').sort().join('|');
    if (!~artoo.store(storage + '-pages').indexOf(page)) {
      fulldata = pastdata.concat(newdata);
      artoo.store.concatTo(storage + '-pages', page);
      artoo.store.concatTo(storage + '-data', newdata);
      artoo.$('#GBMoverlay .GBMpageresults').html('<b>' + newdata.length + ' new results in this page</b>');
    } else {
      fulldata = pastdata;
      artoo.$('#GBMoverlay .GBMpageresults').html('no new result in this page');
    }
    artoo.$('#GBMoverlay .GBMdownloadAll').val('Download complete CSV with all ' + fulldata.length + ' urls');
    if (pastdata.length) {
      artoo.$('#GBMoverlay .GBMoldresults').html('(already ' + pastdata.length + ' results collected from page' + (~donepages.search(/\|/) ? 's ' : ' ') + donepages + ')').show();
      artoo.$('#GBMoverlay .GBMdownloadAll, #GBMoverlay .GBMreset').show();
      artoo.$('#GBMoverlay .GBMdownload').val('Download CSV with only this page\'s results (' + newdata.length + ')');
    } else {
      artoo.$('#GBMoverlay .GBMoldresults').hide();
      artoo.$('#GBMoverlay .GBMdownloadAll, #GBMoverlay .GBMreset').hide();
      artoo.$('#GBMoverlay .GBMdownload').val('Download CSV with ' + newdata.length + ' urls');
    }
  };
  refresh();

  artoo.$("#GBMoverlay .GBMreset").on('click', function(){
    initStore();
    refresh();
  });
  artoo.$("#GBMoverlay .GBMdownload").on('click', function(){
    saveAs(new Blob([artoo.writers.csv(newdata)], {type: "text/plain;charset=utf-8"}), "google-results-" + hlang + "-" + query + "-page" + page + ".csv");
  });
  artoo.$("#GBMoverlay .GBMdownloadAll").on('click', function(){
    saveAs(new Blob([artoo.writers.csv(fulldata)], {type: "text/plain;charset=utf-8"}), "google-results-" + hlang + "-" + query + "-pages" + artoo.store(storage + '-pages').sort().join('-') + ".csv");
  });
  artoo.$("#GBMoverlay .GBMcontinue").on('click', function(){
    window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&hl=' + hlang + "&num=" + total + "&start=" + (start + total);
  });
})();
