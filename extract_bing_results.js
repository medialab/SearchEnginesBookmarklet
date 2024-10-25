(async function () {
    artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", async function() {
        async function scrape() {
            let results = [];
            var scrap = document.querySelectorAll('li[class="b_algo"]');
            for (let i = 0; i < scrap.length; i++) {
                let ele = scrap[i];
                let linkElement = ele.querySelector('div[class="b_attribution"]');
                let link = linkElement ? linkElement.textContent : null;
                let title = ele.querySelector('h2 a[target="_blank"]').textContent;
                let descriptionElement = ele.querySelector('div[class="b_caption"]');
                let description = descriptionElement ? descriptionElement.textContent : ele.querySelector('div:nth-child(2) p').textContent;
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
          loc = window.location,
          pastdata, fulldata, newdata = await scrape(),
          href = loc.href,
          total = (~href.search(/count=/) ? parseInt(href.replace(/^.*[#?&]count=(\d+).*$/, '$1')) : 30),
          start = (~href.search(/first=/) ? parseInt(href.replace(/^.*[#?&]first=(\d+).*$/, '$1')) : 0),
          query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
          storage = 'scrap-query',
          storageKey = query + '/' + total,
          page = start/total,
          initStore = function(){
            artoo.store.set(storage, storageKey);
            artoo.store.set(storage + '-pages', []);
            artoo.store.set(storage + '-data', []);
            pastdata = [];
            fulldata = newdata;
          };

        artoo.store.concatTo = function(key, arr) {
            artoo.store.set(key, artoo.store(key).concat(arr));
        };

        if (artoo.store(storage) !== storageKey) {
            initStore();
        } else {
            pastdata = artoo.store(storage + '-data') || [];
        }

        artoo.$('body').append('<style>' + styles.join('\n') + '</style>' +
        '<div id="BBMoverlay">' +
        '<h2>Extract Bing Results</h2>' +
        '<p>Search for "<b>' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>"<br/>' +
        'page ' + page + ' (with up to ' + total + ' urls per page)</p>' +
        '<p class="BBMpageresults"></p>' +
        '<p class="BBMoldresults"></p>' +
        '<input class="BBMcontinue" type="button" value="Keep existing results & continue to the next page"></input><br/>' +
        '<input class="BBMdownload" type="button"></input><br/>' +
        '<input class="BBMdownloadAll" type="button"></input>' +
        '<input class="BBMreset" type="button" value="Clear existing results from cache"></input>' +
        '</div>');

        var refresh = function(){
            var donepages = artoo.store(storage + '-pages').sort().join('|');
            if (!~artoo.store(storage + '-pages').indexOf(page)) {
              fulldata = pastdata.concat(newdata);
              artoo.store.concatTo(storage + '-pages', page);
              artoo.store.concatTo(storage + '-data', newdata);
              artoo.$('#BBMoverlay .BBMpageresults').html('<b>' + newdata.length + ' new results in this page</b>');
            } else {
              fulldata = pastdata;
              artoo.$('#BBMoverlay .BBMpageresults').html('no new result in this page');
            }
            artoo.$('#BBMoverlay .BBMdownloadAll').val('Download complete CSV with all ' + fulldata.length + ' urls');
            if (pastdata.length) {
              artoo.$('#BBMoverlay .BBMoldresults').html('(already ' + pastdata.length + ' results collected from page' + (~donepages.search(/\|/) ? 's ' : ' ') + donepages + ')').show();
              artoo.$('#BBMoverlay .BBMdownloadAll, #BBMoverlay .BBMreset').show();
              artoo.$('#BBMoverlay .BBMdownload').val('Download CSV with only this page\'s results (' + newdata.length + ')');
            } else {
              artoo.$('#BBMoverlay .BBMoldresults').hide();
              artoo.$('#BBMoverlay .BBMdownloadAll, #BBMoverlay .BBMreset').hide();
              artoo.$('#BBMoverlay .BBMdownload').val('Download CSV with ' + newdata.length + ' urls');
            }
          };
          refresh();
        
          artoo.$("#BBMoverlay .BBMreset").on('click', function(){
            initStore();
            refresh();
          });
          artoo.$("#BBMoverlay .BBMdownload").on('click', function(){
            saveAs(new Blob([artoo.writers.csv(newdata)], {type: "text/plain;charset=utf-8"}), "bing-results-" + query + "-page" + page + ".csv");
          });
          artoo.$("#BBMoverlay .BBMdownloadAll").on('click', function(){
            saveAs(new Blob([artoo.writers.csv(fulldata)], {type: "text/plain;charset=utf-8"}), "bing-results-" + query + "-pages" + artoo.store(storage + '-pages').sort().join('-') + ".csv");
          });
          artoo.$("#BBMoverlay .BBMcontinue").on('click', function(){
            window.location.href = loc.protocol + "//" + loc.hostname + "/search?q=" + query + '&first=' + (start + total) + '&count=' + total + '&FORM=PERE';
          });
    });
})();