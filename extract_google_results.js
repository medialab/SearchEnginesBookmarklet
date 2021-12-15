(function(){
artoo.injectScript("//momentjs.com/downloads/moment-with-locales.min.js", function() {
artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", function() {
  // moment.js deprecated parsing any kind of date format, so let's reinforce it, see https://github.com/moment/moment/issues/1407
  moment.createFromInputFallback = function(config) {
    // unreliable string magic, or
    config._d = new Date(config._i);
  };
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
    translations = {
      "minutes": ["minutes", "minuti", "minutos", "minuten", "minuten"],
      "hours": ["hour", "hours", "heure", "heures", "ora", "ore", "hora", "horas", "stunden", "uur"],
      "days": ["day", "days", "jour", "jours", "giorno", "giorni", "día", "días", "dia", "dias", "tag", "tagen", "dag", "dagen"]
    },
    timeGaps = {};
  Object.keys(translations).forEach(function(k) {
    translations[k].forEach(function(t) {
      timeGaps[t] = k;
    });
  });
  moment.locale(hlang);
  var pastdata, fulldata,
    newdata = artoo.scrape("#rso .g > div[data-hveid], #rso .g > g-section-with-header > div > div", {
      url: {
        sel: 'div a[ping], div a[data-ved]',
        attr: 'href'
      },
      name: {
        sel: 'div a[ping] h3, div a[data-ved] h3',
        method: 'text'
      },
      row: {
        sel: 'div.action-menu > a',
        method: function($){
          var el = $(this);
          if (el.length && el.attr('id')) {
            tmpidx = el.attr('id').replace(/am-b/, '');
            return tmpidx++;
          }
          return tmpidx++;
        }
      },
      description: {
        sel: 'div[style]',
        method: function($){
          var linkdate = artoo.scrape($(this).find('span > span'), 'text'),
            wholedescr = $(this).text();
          if (linkdate) return wholedescr.replace(linkdate, '');
          return wholedescr;
        }
      },
      date: {
        sel: 'div[style] > span > span',
        method: function($){
          var dat = $(this).text().toLowerCase()
            .replace(/ [-—] $/, '')
            .replace(/\s*&nbsp;\s*/, ' ');
          if (dat) {
            try {
              dat = moment(dat).toISOString().slice(0, 10);
            } catch(e) {
              if (! /\d{4}/.test(dat)) {
                var parsed = /(^|\s)(\d+)\s(\w+)(\s|$)/.exec(dat);
                if (parsed) {
                  var num = parsed[2],
                    duration = timeGaps[parsed[3]];
                  if (duration) {
                    dat = moment().subtract(num, duration).toISOString().slice(0, 10);
                  }
                }
              }
            }
          }
          return dat;
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
});
});
})();
