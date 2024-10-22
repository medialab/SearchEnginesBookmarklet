(async function () {
    artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", function() {
        async function moreResult(){
            const button = document.getElementById('more-results');
            if (button) {
                button.click();
                return 1;
            } else {
                return 0;
            }
        }

        async function wait(minDelay, maxDelay) {
            const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
            return new Promise(resolve => setTimeout(resolve, delay));
        }

        async function scrape(n) {
            let results = [];
            var scrap = document.querySelectorAll('li[data-layout="organic"] article');
            let more = 1;
            while(scrap.length < n && more == 1){
                more = await moreResult();
                await wait(1000, 2000);
                var scrap = document.querySelectorAll('li[data-layout="organic"] article');
            }
            scrap = Array.from(scrap).slice(0, n);
            for (let i = 0; i < scrap.length && results.length < n; i++) {
                let ele = scrap[i];
                let titleElement = ele.querySelector('h2 a');
                let title = titleElement ? titleElement.textContent : null;
                let link = titleElement ? titleElement.href : null;
                let descriptionElement = ele.querySelector('article>div>div>div>span');
                let description = descriptionElement ? descriptionElement.textContent : null;

                results.push({
                    title: title,
                    link: link,
                    description: description
                });
            }
            return results;
        }

        var styles = [
            '#DBMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
            '#DBMoverlay h2 {margin: 0px 0px 15px 0px; text-decoration: underline;}',
            '#DBMoverlay input[type="button"] {margin: 3px;}'
          ], 
          href = window.location.href,
          query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
        
        artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
        '<div id="DBMoverlay">' +
        '<h2>Extract DuckDuckGo Results</h2>' +
        '<select id="DBM_number">' +
        '<option value="10">10</option>' +
        '<option value="20">20</option>' +
        '<option value="50">50</option>' +
        '<option value="100">100</option>' +
        '<option value="1000">1000</option>' +
        '</select>' +
        '<input class="DBMdownload" type="button" value="Begin scraping"></input><br/>' +
        '</div>');

        artoo.$("#DBMoverlay .DBMdownload").on('click', async function(){
            select = document.querySelector('select[id="DBM_number"]')
            const n = parseInt(select.value, 10);
            const data = await scrape(n);
            saveAs(new Blob([artoo.writers.csv(data)], {type: "text/plain;charset=utf-8"}), "duckduckgo-results-" + query + "-first" + n + ".csv");
        });

    });
})();