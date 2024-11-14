(function(){
  HTMLBodyElement.prototype.appendChild = Node.prototype.appendChild;
  artoo.injectScript("//medialab.github.io/SearchEnginesBookmarklet/moment-with-locales.min.js", function() {
    artoo.injectScript("//medialab.github.io/SearchEnginesBookmarklet/FileSaver.min.js", function() {

      var loc = window.location,
        href = loc.href,
        translations = {
          "minutes": ["minutes", "minuti", "minutos", "minuten", "minuten"],
          "hours": ["hour", "hours", "heure", "heures", "ora", "ore", "hora", "horas", "stunden", "uur", "小时前"],
          "days": ["day", "days", "jour", "jours", "giorno", "giorni", "día", "días", "dia", "dias", "tag", "tagen", "dag", "dagen", "天前"]
        },
        timeGaps = {},
        query, hlang, total, start, search, nextPageLink,
        styles = [
          '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; width: 400px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 15px; text-align: center; color: black; font-family: monospace; box-sizing: content-box; text-rendering: geometricprecision;}',
          '#BMoverlay h1 {display: block; font-size: 23px; font-weight: bold; margin: 0px 70px 15px 0px; padding: 0; line-height: 22px; text-decoration: underline; font-family: monospace; box-sizing: content-box;}',
          '#BMoverlay #BMlogo {position: absolute; top: 8px; right: 8px; width: 64px; height: 64px;}',
          '#BMoverlay h2 {display: block; font-size: 17px; font-weight: bold; margin: 0px 70px 25px 0px; padding: 0; line-height: 22px; font-family: monospace;}',
          '#BMoverlay p {display: block; font-size: 14px; font-family: monospace; margin: 12px 0; padding: 0; line-height: 16px;}',
          '#BMoverlay input[type="button"] {margin: 5px 0; padding: 5px 10px; font-family: monospace; font-size: 12px; font-weight: bold; border: 1px solid #555; border-radius: 2px; background-color: #EEE; line-height: 14px;}',
          '#BMoverlay #BMfooter {margin: 15px 0 0 0; font-size: 10px; color: #555;}',
          '#BMoverlay #BMfooter a, #BMoverlay #BMfooter a:visited {color: black; text-decoration: underline; color: #555;}'
        ];


      if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
        query = href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1');
        hlang = (~href.search(/hl=/) ? href.replace(/^.*[#?&]hl=([^#?&]+).*$/, '$1') : (($('html').lang) ? $('html').lang.replace(/-.*$/, '') : 'fr'));
        start = (~href.search(/start=/) ? parseInt(href.replace(/^.*[#?&]start=(\d+).*$/, '$1')) : 0);
        if(~href.search(/:\/\/([^.]+\.)?scholar\.google\.[^/]+\//)){
          total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 20);
          search = "Scholar";
          nextPageLink = '[class="gs_ico gs_ico_nav_next"]';
        } else {
          total = (~href.search(/num=/) ? parseInt(href.replace(/^.*[#?&]num=(\d+).*$/, '$1')) : 100);
          search = "Google";
          nextPageLink = "#pnnext";
        }
      } else if(~href.search(/:\/\/([^.]+\.)?bing\.[^/]+\//)){
        query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
        hlang = (~href.search(/setlang=/) ? href.replace(/^.*[#?&]setlang=([^#?&]+).*$/, '$1') : navigator.language.replace(/-.*$/, ''));
        total = (~href.search(/count=/) ? parseInt(href.replace(/^.*[#?&]count=(\d+).*$/, '$1')) : 30);
        start = (~href.search(/first=/) ? parseInt(href.replace(/^.*[#?&]first=(\d+).*$/, '$1')) : 0);
        search = "Bing";
        nextPageLink = ".sw_next";

      } else if(~href.search(/:\/\/([^.]+\.)?baidu\.[^/]+\//)){
        query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined);
        hlang = 'zh';
        total = (~href.search(/rn=/) ? parseInt(href.replace(/^.*[#?&]rn=(\d+).*$/, '$1')) : 50);
        start = (~href.search(/pn=/) ? parseInt(href.replace(/^.*[#?&]pn=(\d+).*$/, '$1')) : 0);
        search = "Baidu";
        nextPageLink = "a.n:last-child";
      }

      Object.keys(translations).forEach(function(k) {
        translations[k].forEach(function(t) {
          timeGaps[t] = k;
        });
      });

      moment.locale(hlang);
      moment.createFromInputFallback = function(config) {
        config._d = new Date(config._i);
      };
      function relative_date_converter(date){
        if (!date) return;
        let res;
        if (/\b\d{4}年\d{1,2}月\d{1,2}日$/.test(date)) {
          res = moment(date, "YYYY年MM月DD日").format("YYYY-MM-DD");
        } else if (/^.* · (\d{4})\b.*$/.test(date)) {
          res = date.split("·")[1].trim();
        } else {
          res = date
            .replace(/\bf[eé]vr?(ier|\.)?\b/, "feb")
            .replace(/\bavr(il|\.)?\b/, "apr")
            .replace(/\bmai\b/, "may")
            .replace(/\bjuin\b/, "jun")
            .replace(/\bjuil(let|\.)?\b/, "jul")
            .replace(/\bao[uû](t|\.)?\b/, "aug")
            .replace(/\bdéc(embre|\.)?\b/, "dec");
          res = moment(res).format("YYYY-MM-DD");
        }
        res = res.replace("Invalid date", "");
        if (!/\d{4}/.test(res)) {
          var parsed;
          if (/(\d+)天前/.test(date)) {
            parsed = /(\d+)\s*天前/.exec(date);
            res = moment().subtract(parsed[1], 'days').toISOString().slice(0, 10);
          } else if (/(\d+)小时前/.test(date)) {
            parsed = /(\d+)\s*小时前/.exec(date);
            res = moment().subtract(parsed[1], 'hours').toISOString().slice(0, 10);
          } else if (/昨天(\d+:\d+)/.test(date)) {
            parsed = /昨天(\d+:\d+)/.exec(date);
            res = moment().subtract(1, 'days').format("YYYY-MM-DD") + ' ' + parsed[1];
          } else {
            parsed = /(^|\s)(\d+)\s(\w+)(\s|$)/.exec(date.replace(/^Auj\.?/, "il y a 0 jours"));
            if (parsed) {
              var num = parsed[2],
                duration = timeGaps[parsed[3]];
              if (duration) {
                res = moment().subtract(num, duration).toISOString().slice(0, 10);
              }
            }
          }
        }
        return res || date;
      }

      var pastdata, fulldata, newdata,
        page = start/total + 1,
        storage = 'scrap-query',
        storageKey = query + '/' + hlang + '/' + total,
        initStore = function(){
          artoo.store.set(storage, storageKey);
          artoo.store.set(storage + '-pages', []);
          artoo.store.set(storage + '-data', []);
          pastdata = [];
          fulldata = newdata;
        };

      function scrape() {
        let results = [];
        var link, title, desc, date,
          scrap = document.querySelectorAll(
            search === 'Bing'
            ? 'li[class="b_algo"]'
            : 'div[class="result c-container xpath-log new-pmd"]'
          );

        for (let i = 0; i < scrap.length; i++) {
          let ele = scrap[i];

          // Bing results
          if (search === 'Bing') {
            let linkElement = ele.querySelector('div[class="b_attribution"]');
            link = linkElement ? linkElement.textContent : "";
            title = ele.querySelector('h2 a[target="_blank"]').textContent;
            let descriptionElement = ele.querySelector('div p');
            desc = descriptionElement ? descriptionElement.textContent : "";
            let try_date = ele.querySelector('span[class="news_dt"]');
            date = try_date ? try_date : "";
            if (date) date = date.textContent;

          // Baidu results
          } else if (search === 'Baidu') {
            let titleElement = ele.querySelector('div>div>h3>a');
            title = titleElement ? titleElement.textContent : "";
            link = ele.getAttribute('mu');
            let descriptionElement = ele.querySelector('span[class*="content"]');
            desc = descriptionElement ? descriptionElement.textContent : "";
            let date_list = ele.querySelectorAll('[class*="c-color-gray2"]');
            if (date_list.length > 0) {
              date_list.length > 1 ? date = date_list[0].textContent.split(' ').at(-1) : date = date_list[0].textContent;
            } else {
              date = "";
            }
          }

          results.push({
            name: title,
            url: link,
            description: desc,
            date: relative_date_converter(date.trim())
          });
        }
        return results;
      }

      function scrape_scholar(){
        let results = [],
        scrap = document.querySelectorAll('div[class="gs_r gs_or gs_scl"]');
        for (let i = 0; i < scrap.length; i++) {
          let ele = scrap[i],
          name = ele.querySelector('h3.gs_rt').textContent,
          try_link = ele.querySelector('h3.gs_rt a'),
          link = try_link ? try_link.href : "",
          try_desc = ele.querySelector('div.gs_rs'),
          desc = try_desc ? try_desc.textContent : "",
          infos = ele.querySelector('div.gs_a').textContent.split('-'),
          authors = infos[0],
          n_quote = ele.querySelector('div[class="gs_fl gs_flb"] a:nth-of-type(3)').textContent;
          if(/\d+/.test(n_quote)){
            n_quote = n_quote.match(/\d+/)[0];
          } else {
            n_quote = "";
          }

          results.push({
            name: name,
            url: link,
            description: desc,
            authors: authors,
            n_quote: n_quote
          });
        } 
        return results;
      }

      // Google results
      if (search === 'Google') {
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
        });
      } else if (search === 'Scholar'){
        newdata = scrape_scholar();
      } else {
        newdata = scrape();
      }

      artoo.store.concatTo = function(key, arr) {
        artoo.store.set(key, artoo.store(key).concat(arr));
      }

      if (artoo.store(storage) !== storageKey || page === 1) {
        initStore();
      } else {
        pastdata = artoo.store(storage + '-data') || [];
      }

      const displayContinue = !!(document.querySelector(nextPageLink));

      // In-page popup injection
      artoo.$('body').append(
        '<style>' + styles.join('\n') + '</style>' +
        '<div id="BMoverlay">' +
          '<h1>SearchEngineBookmarklets</h1>' +
          '<img id="BMlogo" src="https://medialab.github.io/SearchEnginesBookmarklet/images/duckduckgo-google-bing-baidu-256.png" alt="SEB logo" />' +
          '<h2>Extract ' + search + ' results</h2>' +
          '<p>Search for «&nbsp;<b>' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>&nbsp;»<br/>' +
            (displayContinue ? 'page ' + page : 'last page') +
            ' (with up to ' + total + ' results per page)</p>' +
          '<p class="BMpageresults"></p>' +
          '<p class="BMoldresults"></p>' +
          (displayContinue
          ? '<input class="BMcontinue" type="button" value="Keep existing results & continue to the next page"></input>'
          : '') +
          '<input class="BMdownloadAll" type="button"></input>' +
          '<input class="BMdownload" type="button"></input>' +
          '<input class="BMreset" type="button" value="Clear stored results and restart from first page"></input>' +
          '<p id="BMfooter">Powered by <a target="_blank" href="https://medialab.sciencespo.fr/">médialab Sciences Po</a> &ndash; Discover more <a target="_blank" href="https://medialab.sciencespo.fr/en/tools/">médialab tools</a>!</p>' +
        '</div>'
      );

      var refresh = function(){
        var donepages = artoo.store(storage + '-pages').sort().join('-');
        if (!~artoo.store(storage + '-pages').indexOf(page)) {
          fulldata = pastdata.concat(newdata);
          artoo.store.concatTo(storage + '-pages', page);
          artoo.store.concatTo(storage + '-data', newdata);
          artoo.$('#BMoverlay .BMpageresults').html('<b>' + newdata.length + ' new results in this page</b>');
        } else {
          fulldata = pastdata;
          artoo.$('#BMoverlay .BMpageresults').html('no new result in this page');
        }
        artoo.$('#BMoverlay .BMdownloadAll').val('Download complete CSV with all ' + fulldata.length + ' results');
        if (pastdata.length) {
          artoo.$('#BMoverlay .BMoldresults').html('(already ' + pastdata.length + ' results collected<br/>from page' + (~donepages.search(/\-/) ? 's ' : ' ') + donepages + ')').show();
          artoo.$('#BMoverlay .BMdownloadAll, #BMoverlay .BMreset').show();
          artoo.$('#BMoverlay .BMdownload').val('Download CSV with only this page\'s results (' + newdata.length + ')');
        } else {
          artoo.$('#BMoverlay .BMoldresults').hide();
          artoo.$('#BMoverlay .BMdownloadAll, #BMoverlay .BMreset').hide();
          artoo.$('#BMoverlay .BMdownload').val('Download CSV with ' + newdata.length + ' results');
        }
      };
      refresh();

      const redirect = function(tot, st) {
        if (search === 'Google') {
          window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&hl=' + hlang + "&num=" + tot + "&start=" + st;
        } else if (search === 'Bing') {
          window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&count=' + tot + '&first=' + st + '&FORM=PERE';
        } else if (search === 'Baidu') {
          window.location.href = loc.protocol + "//" + loc.hostname + "/s?wd=" + query + '&rn=' + tot + '&pn=' + st;
        } else if (search === 'Scholar') {
          window.location.href = loc.protocol + "//" + loc.hostname + "/scholar?q=" + query + '&hl=' + hlang + "&num=" + tot + "&start=" + st;
        }
      };

      artoo.$("#BMoverlay .BMreset").on('click', function(){
        initStore();
        redirect(total, 0);
      });

      artoo.$("#BMoverlay .BMdownload").on('click', function(){
        saveAs(
          new Blob([artoo.writers.csv(newdata)],
                   {type: "text/plain;charset=utf-8"}),
          search.toLowerCase() + "-results-" + hlang + "-" + query + "-page" + page + ".csv"
        );
      });

      artoo.$("#BMoverlay .BMdownloadAll").on('click', function(){
        saveAs(
          new Blob([artoo.writers.csv(fulldata)],
                   {type: "text/plain;charset=utf-8"}),
          search.toLowerCase() + "-results-" + hlang + "-" + query + "-pages" + artoo.store(storage + '-pages').sort().join('-') + ".csv"
        );
      });

      artoo.$("#BMoverlay .BMcontinue").on('click', function(){
        redirect(total, start + total);
      });
    });
  });
})();
