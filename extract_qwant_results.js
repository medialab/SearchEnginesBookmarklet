(async function () {
    artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", function() {
        async function moreResult(){
            const button = document.querySelector('[data-testid="buttonShowMore"]');
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
            var scrap = document.querySelectorAll('div[data-testid="webResult"]');
            let more = 1;

            updateProgress(scrap.length, n);

            while(scrap.length < n && more == 1){
                more = await moreResult();
                await wait(1000, 2000);
                var scrap = document.querySelectorAll('div[data-testid="webResult"]');
                updateProgress(scrap.length, n);
            }
            scrap = Array.from(scrap).slice(0, n);
            for (let i = 0; i < scrap.length && results.length < n; i++) {
                let ele = scrap[i];
                let title = ele.querySelector('a>div>span').textContent;
                let link = ele.getAttribute('domain');
                let description = ele.querySelectorAll('div[data-testid="webResult"]>div>div>div>div>div')[1].textContent;

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
            const progressBar = document.querySelector('#QBMprogressBar');
            const progressText = document.querySelector('#QBMprogressText');
            let percentage = Math.min((current / total) * 100, 100);
            progressBar.style.width = percentage + '%';
            progressText.textContent = `Collected ${current} of ${total} results`;
        }

        var styles = [
            '#QBMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 300px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
            '#QBMoverlay h2 {margin: 0px 0px 15px 0px; text-decoration: underline;}',
            '#QBMoverlay input[type="button"] {margin: 3px;}',
            '#QBMprogressContainer {background-color: #f3f3f3; border-radius: 5px; width: 100%; height: 20px; margin-top: 10px;}',
            '#QBMprogressBar {height: 100%; width: 0; background-color: #4caf50; border-radius: 5px;}',
            '#QBMprogressText {margin-top: 5px;}'
        ], 
          href = window.location.href,
          query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined);
        
        artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
        '<div id="QBMoverlay">' +
        '<h2>Extract Qwant Results</h2>' +
        '<p>Number of results :</p>' +
        '<input type="number" id="QBM_number"></br></br>' +
        '<input class="QBMdownload" type="button" value="Begin scraping" required></input><br/>' +
        '<div id="QBMprogressContainer"><div id="QBMprogressBar"></div></div>' +
        '<p id="QBMprogressText">Collected 0 of 0 results</p>' +
        '</div>');

        artoo.$("#QBMoverlay .QBMdownload").on('click', async function(){
            input = document.querySelector('input[id="QBM_number"]')
            const n = parseInt(input.value, 10);
            const data = await scrape(n);
            updateProgress(data.length, data.length);
            saveAs(new Blob([artoo.writers.csv(data)], {type: "text/plain;charset=utf-8"}), "qwant-results-" + query + "-first" + data.length + ".csv");
        });

    });
})();