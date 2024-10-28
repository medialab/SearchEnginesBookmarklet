(async function () {
    artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", function() {
        var loc = window.location,
            href = loc.href,
            styles = [
                '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 300px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
                '#BMoverlay h2 {margin: 0px 0px 15px 0px; text-decoration: underline;}',
                '#BMoverlay input[type="button"] {margin: 3px;}',
                '#BMprogressContainer {background-color: #f3f3f3; border-radius: 5px; width: 100%; height: 20px; margin-top: 10px;}',
                '#BMprogressBar {height: 100%; width: 0; background-color: #4caf50; border-radius: 5px;}',
                '#BMprogressText {margin-top: 5px;}'
            ],
            query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
            search;
            ~href.search(/:\/\/([^.]+\.)?qwant\.[^/]+\//) ? search = 'Qwant' : search = 'DuckDuckGo';
        async function moreResult(href){
            let button;
            if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
                button = document.getElementById('more-results');
            } else {
                button = document.querySelector('[data-testid="buttonShowMore"]');
            }
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

        async function scrape(n, href) {
            let scrap_str, ele, title, link, desc;
            let results = [];
            ~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//) ? scrap_str = 'li[data-layout="organic"] article' : scrap_str = 'div[data-testid="webResult"]';
            var scrap = document.querySelectorAll(scrap_str);
            let more = 1;

            updateProgress(scrap.length, n);

            while(scrap.length < n && more == 1){
                more = await moreResult(href);
                await wait(1000, 2000);
                var scrap = document.querySelectorAll(scrap_str);
                updateProgress(scrap.length, n);
            }
            scrap = Array.from(scrap).slice(0, n);
            for (let i = 0; i < scrap.length && results.length < n; i++) {
                ele = scrap[i];
                if(~href.search(/:\/\/([^.]+\.)?duckduckgo\.[^/]+\//)){
                    let titleElement = ele.querySelector('h2 a');
                    title = titleElement ? titleElement.textContent : null;
                    link = titleElement ? titleElement.href : null;
                    let descriptionElement = ele.querySelector('article>div>div>div>span');
                    description = descriptionElement ? descriptionElement.textContent : null;
                } else {
                    title = ele.querySelector('a>div>span').textContent;
                    link = ele.getAttribute('domain');
                    description = ele.querySelectorAll('div[data-testid="webResult"]>div>div>div>div>div')[1].textContent;
                }
                
                results.push({
                    title: title,
                    link: link,
                    description: description
                });
                updateProgress(results.length, n);
            }
            return results;
        }

        function updateProgress(current, total) {
            const progressBar = document.querySelector('#BMprogressBar');
            const progressText = document.querySelector('#BMprogressText');
            let percentage = Math.min((current / total) * 100, 100);
            progressBar.style.width = percentage + '%';
            progressText.textContent = `Collected ${current} of ${total} results`;
        }
        
        artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
        '<div id="BMoverlay">' +
        '<h2>Extract '+ search +' Results</h2>' +
        '<p>Number of results :</p>' +
        '<input type="number" id="BM_number"></br></br>' +
        '<input class="BMdownload" type="button" value="Begin scraping" required></input><br/>' +
        '<div id="BMprogressContainer"><div id="BMprogressBar"></div></div>' +
        '<p id="BMprogressText">Collected 0 of 0 results</p>' +
        '</div>');

        artoo.$("#BMoverlay .BMdownload").on('click', async function(){
            input = document.querySelector('input[id="BM_number"]')
            const n = parseInt(input.value, 10);
            const data = await scrape(n, href);
            updateProgress(data.length, data.length);
            saveAs(new Blob([artoo.writers.csv(data)], {type: "text/plain;charset=utf-8"}), search.toLowerCase() + "-results-" + query + "-first" + data.length + ".csv");
        });

    });
})();