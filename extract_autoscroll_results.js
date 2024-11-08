(async function () {
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
        query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
        hlang = navigator.language.replace(/-.*$/, ''),
        search = ~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//) ? 'Qwant' : 'DuckDuckGo',
        styles = [
          '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; width: 400px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 15px; text-align: center; color: black; font-family: monospace; box-sizing: content-box; text-rendering: geometricprecision;}',
          '#BMoverlay h1 {display: block; font-size: 23px; font-weight: bold; margin: 0px 70px 15px 0px; padding: 0; line-height: 22px; text-decoration: underline; font-family: monospace; box-sizing: content-box;}',
          '#BMoverlay #BMlogo {position: absolute; top: 8px; right: 8px; width: 64px; height: 64px;}',
          '#BMoverlay h2 {display: block; font-size: 17px; font-weight: bold; margin: 0px 70px 25px 0px; padding: 0; line-height: 22px; font-family: monospace;}',
          '#BMoverlay p {display: block; font-size: 14px; font-family: monospace; margin: 12px 0; padding: 0; line-height: 16px;}',
          '#BMoverlay #BMnumber {margin: 0 0 0 10px; padding: 0 5px; height: 20px; color: unset; border: 1px solid #555; border-radius: 1px; font-family: monospace; width:45px; box-sizing: content-box; font-size: 14px;}',
          '#BMoverlay input[type="button"] {margin: 5px 0; padding: 5px 10px; font-family: monospace; font-size: 12px; font-weight: bold; border: 1px solid #555; border-radius: 1px; line-height: 14px;}',
          '#BMprogressContainer {background-color: #f3f3f3; border-radius: 5px; width: 100%; height: 20px; margin-top: 10px;}',
          '#BMprogressBar {height: 100%; width: 0; background-color: #4caf50; border-radius: 5px;}',
          '#BMprogressText {margin-top: 5px;}',
          '#BMoverlay #BMfooter {margin: 15px 0 0 0; font-size: 10px; color: #555;}',
          '#BMoverlay #BMfooter a, #BMoverlay #BMfooter a:visited {color: black; text-decoration: underline; color: #555;}'
        ];

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
            parsed = /(^|\s)(\d+)\s(\w+)(\s|$)/.exec(date);
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

      function moreResult(href){
        let button;
        if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
          button = document.getElementById('more-results');
        } else {
          button = document.querySelector('[data-testid="buttonShowMore"]');
        }
        if (button) {
          button.click();
          return 1;
        }
        return 0;
      }

      async function wait(minDelay, maxDelay) {
        const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
        return new Promise(resolve => setTimeout(resolve, delay));
      }

      function updateProgress(current, total) {
        const progressBar = document.querySelector('#BMprogressBar');
        const progressText = document.querySelector('#BMprogressText');
        let percentage = Math.min((current / total) * 100, 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = `Collected ${current} of ${total} results`;
      }

      async function scrape(n, href) {
        let ele, title, link, description, date,
          results = [];
          more = 1,
          scrap_str = ~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//) ? 'li[data-layout="organic"] article' : 'div[data-testid="webResult"]';
        var scrap = document.querySelectorAll(scrap_str);

        updateProgress(scrap.length, n);

        while(scrap.length < n && more == 1){
          more = moreResult(href);
          await wait(1000, 2000);
          var scrap = document.querySelectorAll(scrap_str);
          updateProgress(scrap.length, n);
        }

        scrap = Array.from(scrap).slice(0, n);
        for (let i = 0; i < scrap.length && results.length < n; i++) {
          ele = scrap[i];

          // DuckDuckGo results
          if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
            let titleElement = ele.querySelector('h2 a');
            title = titleElement ? titleElement.textContent : null;
            link = titleElement ? titleElement.href : null;
            let descriptionElement = ele.querySelector('article>div>div>div>span');
            description = descriptionElement ? descriptionElement.textContent : null;
            let try_date = descriptionElement.querySelector('span>span[class]');
            date = try_date ? relative_date_converter(try_date.textContent) : "";

          // Qwant results
          } else {
            title = ele.querySelector('a>div>span').textContent;
            link = ele.getAttribute('domain');
            description = ele.querySelectorAll('div[data-testid="webResult"]>div>div>div>div>div')[1].textContent;
            date = ""
          }

          results.push({
            name: title,
            url: link,
            description: description,
            date: date
          });

          updateProgress(results.length, n);
        }
        return results;
      }

      // In-page popup injection
      artoo.$('body').append(
        '<style>' + styles.join('\n') + '</style>' +
        '<div id="BMoverlay">' +
          '<h1>SearchEngineBookmarklets</h1>' +
          '<img id="BMlogo" src="https://medialab.github.io/SearchEnginesBookmarklet/images/duckduckgo-google-bing-baidu-256.png" alt="SEB logo" />' +
          '<h2>Extract ' + search + ' results</h2>' +
          '<p>Search for «&nbsp;<b>' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>&nbsp;»</p>' +
          '<p>How many results to collect at most?' +
            '<input type="number" id="BMnumber" value="' + (search === 'Qwant' ? 50 : 100) + '"></input>' +
          '</p>' +
          '<p>The page will be automatically expanded until reaching desired number of results.<br/>' +
             'You might need to validate some CAPTCHA.</p>' +
          '<input class="BMdownload" type="button" value="Start download"></input>' +
          '<div id="BMprogressContainer">' +
            '<div id="BMprogressBar"></div>' +
          '</div>' +
          '<p id="BMprogressText"></p>' +
          '<p id="BMfooter">Powered by <a target="_blank" href="https://medialab.sciencespo.fr/">médialab Sciences Po</a> &ndash; Discover more <a target="_blank" href="https://medialab.sciencespo.fr/en/tools/">médialab tools</a>!</p>' +
        '</div>'
      );

      artoo.$("#BMoverlay .BMdownload").on('click', async function(){
        input = document.querySelector('#BMnumber')
        const n = parseInt(input.value, 10);
        const data = await scrape(n, href);
        updateProgress(data.length, data.length);
        saveAs(new Blob([artoo.writers.csv(data)], {type: "text/plain;charset=utf-8"}), search.toLowerCase() + "-results-" + query + "-first" + data.length + ".csv");
      });

    });
  });
})();
