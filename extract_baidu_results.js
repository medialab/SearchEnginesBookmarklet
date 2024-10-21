(async function () {
    artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", function() {
        async function scrape() {
            let results = [];
            var scrap = document.querySelectorAll('div[class="c-container"]'); // version sans les op
            for (let i = 0; i < scrap.length; i++) {
                let ele = scrap[i];
                let titleElement = ele.querySelector('div>h3>a');
                let title = titleElement ? titleElement.textContent : null;
                let link = titleElement ? titleElement.href : null;
                let descriptionElement = ele.querySelector('span[class*="content"');
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
            '#BBMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; height: 250px; width: 330px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 20px; text-align: center;}',
            '#BBMoverlay h2 {margin: 0px 0px 15px 0px; text-decoration: underline;}',
            '#BBMoverlay input[type="button"] {margin: 3px;}'
          ],
          href = window.location.href,
          total = (~href.search(/rn=/) ? parseInt(href.replace(/^.*[#?&]rn=(\d+).*$/, '$1')) : 50),
          start = (~href.search(/pn=/) ? parseInt(href.replace(/^.*[#?&]pn=(\d+).*$/, '$1')) : 0),
          query = (~href.search(/[#?&]wd=/) ? href.replace(/^.*[#?&]wd=([^#?&]+).*$/, '$1') : undefined),
          page = start/total;
        
        artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
        '<div id="BBMoverlay">' +
        '<h2>Extract Baidu Results</h2>' +
        '<p>Search for "<b>' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>"<br/>' +
        'page ' + page + ' (with up to ' + total + ' urls per page)</p>' +
        '<input class="BBMdownload" type="button" value="Begin scraping"></input><br/>' +
        '</div>');

        artoo.$("#BBMoverlay .BBMdownload").on('click', async function(){
            const data = await scrape();
            artoo.saveCsv(data);
        });

    });
})();