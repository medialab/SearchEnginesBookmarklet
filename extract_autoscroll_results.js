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
        hlang = navigator.language,
        search = ~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//) ? 'Qwant' : 'DuckDuckGo',
        styles = [
          '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 300px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
          '#BMoverlay h2 {display: block; font-size: 20px; font-family: Arial, sans-serif; font-weight: bold; margin: 0px 0px 15px 0px; padding: 0; line-height: 22px; text-decoration: underline;}',
          '#BMoverlay input[type="button"] {margin: 3px;}',
          '#BMnumber {width: 50px}',
          '#BMprogressContainer {background-color: #f3f3f3; border-radius: 5px; width: 100%; height: 20px; margin-top: 10px;}',
          '#BMprogressBar {height: 100%; width: 0; background-color: #4caf50; border-radius: 5px;}',
          '#BMprogressText {margin-top: 5px;}'
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
        return date;
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
            title: title,
            link: link,
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
          '<h2>Extract ' + search + ' Results</h2>' +
          '<p>Maximum number of results desired:</p>' +
          '<input type="number" id="BMnumber" value="100"></br></br>' +
          '<input class="BMdownload" type="button" value="Begin scraping" required></input><br/>' +
          '<div id="BMprogressContainer">' +
            '<div id="BMprogressBar"></div>' +
          '</div>' +
          '<p id="BMprogressText">Collected 0 of 0 results</p>' +
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
