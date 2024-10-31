(function(){
  HTMLBodyElement.prototype.appendChild = Node.prototype.appendChild;
  artoo.injectScript("//medialab.github.io/google-bookmarklets/moment-with-locales.min.js", function() {
  artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", function() {
    moment.createFromInputFallback = function(config) {
      config._d = new Date(config._i);
    };

    function relative_date_converter(date){
      if (date) {
        try {
          if (/^\d{4}年\d{1,2}月\d{1,2}日$/.test(date)) {
            date = moment(date, "YYYY年MM月DD日").format("YYYY-MM-DD");
        } else {
            date = moment(date).toISOString().slice(0, 10);
        }
        } catch (e) {
            if (!/\d{4}/.test(date)) {
                var parsed;
                
                if (/(\d+)天前/.test(date)) {
                    parsed = /(\d+)\s*天前/.exec(date);
                    date = moment().subtract(parsed[1], 'days').toISOString().slice(0, 10);
    
                } else if (/(\d+)小时前/.test(date)) {
                    parsed = /(\d+)\s*小时前/.exec(date);
                    date = moment().subtract(parsed[1], 'hours').toISOString().slice(0, 10);
    
                } else if (/昨天(\d+:\d+)/.test(date)) {
                    parsed = /昨天(\d+:\d+)/.exec(date);
                    date = moment().subtract(1, 'days').format("YYYY-MM-DD") + ' ' + parsed[1];
    
                } else {
                    parsed = /(^|\s)(\d+)\s(\w+)(\s|$)/.exec(date);
                    if (parsed) {
                        var num = parsed[2],
                            duration = timeGaps[parsed[3]];
                        if (duration) {
                            date = moment().subtract(num, duration).toISOString().slice(0, 10);
                        }
                    }
                }
            }
        }
      }
      return date;
    }

    function scrape(href) {
      let results = [];
      var scrap, link, title, desc, date;
      ~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//) ? scrap = document.querySelectorAll('li[class="b_algo"]') : scrap = document.querySelectorAll('div[class="result c-container xpath-log new-pmd"]');
      for (let i = 0; i < scrap.length; i++) {
          let ele = scrap[i];
          if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
            let linkElement = ele.querySelector('div[class="b_attribution"]');
            link = linkElement ? linkElement.textContent : null;
            title = ele.querySelector('h2 a[target="_blank"]').textContent;
            let descriptionElement = ele.querySelector('div p');
            desc = descriptionElement ? descriptionElement.textContent : null;
            let try_date = ele.querySelector('span[class="news_dt"]');
            date = try_date ? try_date : "";
            if (date){date = date.textContent}
          } else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
            let ele = scrap[i];
            let titleElement = ele.querySelector('div>div>h3>a');
            title = titleElement ? titleElement.textContent : null;
            link = ele.getAttribute('mu');
            let descriptionElement = ele.querySelector('span[class*="content"]');
            desc = descriptionElement ? descriptionElement.textContent : null;
            let date_list = ele.querySelectorAll('[class*="c-color-gray2"]');
            if (date_list.length > 0){
              date_list.length > 1 ? date = date_list[0].textContent.split(' ').at(-1) : date = date_list[0].textContent;
            } else{
              date = "";
            }
          }
          date = relative_date_converter(date.trim());
          results.push({
              title: title,
              link: link,
              description: desc,
              date: date
          });
      }
      return results;
    }

    var loc = window.location,
      href = loc.href,
      translations = {
        "minutes": ["minutes", "minuti", "minutos", "minuten", "minuten"],
        "hours": ["hour", "hours", "heure", "heures", "ora", "ore", "hora", "horas", "stunden", "uur", "小时前"],
        "days": ["day", "days", "jour", "jours", "giorno", "giorni", "día", "días", "dia", "dias", "tag", "tagen", "dag", "dagen", "天前"]
      },
      timeGaps = {},
      query, hlang, total, start;
    if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
      query = href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1');
      hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&]hl=([^#?&]+).*$/, '$1') : (($('html').lang) ? $('html').lang.substr(0,2) : 'fr'));
      total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 100);
      start = (~href.search(/start=/) ? parseInt(href.replace(/^.*[#?&]start=(\d+).*$/, '$1')) : 0);
    } else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
      query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
      total = (~href.search(/count=/) ? parseInt(href.replace(/^.*[#?&]count=(\d+).*$/, '$1')) : 30);
      start = (~href.search(/first=/) ? parseInt(href.replace(/^.*[#?&]first=(\d+).*$/, '$1')) : 0);
      hlang = (~href.search(/setlang=/) ? href.replace(/^.*[#?&]setlang=([^#?&]+).*$/, '$1') : navigator.language);
    } else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
      total = (~href.search(/rn=/) ? parseInt(href.replace(/^.*[#?&]rn=(\d+).*$/, '$1')) : 50);
      start = (~href.search(/pn=/) ? parseInt(href.replace(/^.*[#?&]pn=(\d+).*$/, '$1')) : 0);
      query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined);
      hlang = 'zh';
    }
    var page = start/total,
      storage = 'scrap-query',
      storageKey = query + '/' + hlang + '/' + total
    Object.keys(translations).forEach(function(k) {
      translations[k].forEach(function(t) {
        timeGaps[t] = k;
      });
    });
    moment.locale(hlang);
    var pastdata, fulldata, newdata,
      styles = [
        '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
        '#BMoverlay h2 {margin: 0px 0px 15px 0px; text-decoration: underline;}',
        '#BMoverlay input[type="button"] {margin: 3px;}'
      ],
      initStore = function(){
        artoo.store.set(storage, storageKey);
        artoo.store.set(storage + '-pages', []);
        artoo.store.set(storage + '-data', []);
        pastdata = [];
        fulldata = newdata;
      };
    
      if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
        newdata = artoo.scrape("#rso .g > div[data-hveid], #rso .g[data-hveid], #rso .g > g-section-with-header > div > div, div[data-async-context] .g[data-hveid]", {
          name: {
            sel: 'div a[ping] h3, div a[data-ved] h3',
            method: 'text'
          },
          url: {
            sel: 'div a[ping], div a[data-ved]',
            attr: 'href'
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
              return relative_date_converter(dat);
            }
          }
        })
      } else{
        newdata = scrape(href)
      }

    artoo.store.concatTo = function(key, arr) {
      artoo.store.set(key, artoo.store(key).concat(arr));
    }
  
    if (artoo.store(storage) !== storageKey) {
      initStore();
    } else {
      pastdata = artoo.store(storage + '-data') || [];
    }
  
    artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
      '<div id="BMoverlay">' +
        '<h2>Extract Results</h2>' +
        '<p>Search for "<b>' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>"<br/>' +
          'page ' + page + ' (with up to ' + total + ' urls per page)</p>' +
        '<p class="BMpageresults"></p>' +
        '<p class="BMoldresults"></p>' +
        '<input class="BMcontinue" type="button" value="Keep existing results & continue to the next page"></input><br/>' +
        '<input class="BMdownload" type="button"></input><br/>' +
        '<input class="BMdownloadAll" type="button"></input>' +
        '<input class="BMreset" type="button" value="Clear existing results from cache"></input>' +
      '</div>');
  
    var refresh = function(){
      var donepages = artoo.store(storage + '-pages').sort().join('|');
      if (!~artoo.store(storage + '-pages').indexOf(page)) {
        fulldata = pastdata.concat(newdata);
        artoo.store.concatTo(storage + '-pages', page);
        artoo.store.concatTo(storage + '-data', newdata);
        artoo.$('#BMoverlay .BMpageresults').html('<b>' + newdata.length + ' new results in this page</b>');
      } else {
        fulldata = pastdata;
        artoo.$('#BMoverlay .BMpageresults').html('no new result in this page');
      }
      artoo.$('#BMoverlay .BMdownloadAll').val('Download complete CSV with all ' + fulldata.length + ' urls');
      if (pastdata.length) {
        artoo.$('#BMoverlay .BMoldresults').html('(already ' + pastdata.length + ' results collected from page' + (~donepages.search(/\|/) ? 's ' : ' ') + donepages + ')').show();
        artoo.$('#BMoverlay .BMdownloadAll, #BMoverlay .BMreset').show();
        artoo.$('#BMoverlay .BMdownload').val('Download CSV with only this page\'s results (' + newdata.length + ')');
      } else {
        artoo.$('#BMoverlay .BMoldresults').hide();
        artoo.$('#BMoverlay .BMdownloadAll, #BMoverlay .BMreset').hide();
        artoo.$('#BMoverlay .BMdownload').val('Download CSV with ' + newdata.length + ' urls');
      }
    };
    refresh();
  
    artoo.$("#BMoverlay .BMreset").on('click', function(){
      initStore();
      refresh();
    });
    artoo.$("#BMoverlay .BMdownload").on('click', function(){
      saveAs(new Blob([artoo.writers.csv(newdata)], {type: "text/plain;charset=utf-8"}), loc.hostname.split(".").at(1) + "-results-" + hlang + "-" + query + "-page" + page + ".csv");
    });
    artoo.$("#BMoverlay .BMdownloadAll").on('click', function(){
      saveAs(new Blob([artoo.writers.csv(fulldata)], {type: "text/plain;charset=utf-8"}), loc.hostname.split(".").at(1) + "-results-" + hlang + "-" + query + "-pages" + artoo.store(storage + '-pages').sort().join('-') + ".csv");
    });
    artoo.$("#BMoverlay .BMcontinue").on('click', function(){
      if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
        window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&hl=' + hlang + "&num=" + total + "&start=" + (start + total);
      } else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
        window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&first=' + (start + total) + '&count=' + total + '&FORM=PERE';
      } else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
        window.location.href = loc.protocol + "//" + loc.hostname + "/s?wd=" + query + '&pn=' + (start + total) + '&rn=' + total;
      }
    });
  });
  });
  })();
  