(function(){
    artoo.injectScript("//medialab.github.io/SearchEnginesBookmarklet/FileSaver.min.js", function() {
        var loc = window.location,
            href = loc.href,
            query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined)
            search,
            styles = [
                '#BMoverlay {z-index: 1000000; position: fixed; top: 150px; right: 10px; background-color: white; width: 400px; border-radius: 5px; box-shadow: 1px 1px 5px 3px #656565; padding: 15px; text-align: center; color: black; font-family: monospace; box-sizing: content-box; text-rendering: geometricprecision;}',
                '#BMoverlay h1 {display: block; font-size: 23px; font-weight: bold; margin: 0px 70px 15px 0px; padding: 0; line-height: 22px; text-decoration: underline; font-family: monospace; box-sizing: content-box;}',
                '#BMoverlay #BMlogo {position: absolute; top: 8px; right: 8px; width: 64px; height: 64px;}',
                '#BMoverlay h2 {display: block; font-size: 17px; font-weight: bold; margin: 0px 70px 25px 0px; padding: 0; line-height: 22px; font-family: monospace;}',
                '#BMoverlay p {display: block; font-size: 14px; font-family: monospace; margin: 12px 0; padding: 0; line-height: 16px;}',
                '#BMoverlay #BMnumber {margin: 0 0 0 10px; padding: 0 5px; height: 20px; color: unset; border: 1px solid #555; border-radius: 2px; font-family: monospace; width:45px; box-sizing: content-box; background-color: #EEE; font-size: 14px;}',
                '#BMoverlay input[type="button"] {margin: 5px 0; padding: 5px 10px; font-family: monospace; font-size: 14px; font-weight: bold; border: 1px solid #555; border-radius: 2px; background-color: #EEE; line-height: 14px;}',
                '#BMprogressContainer {background-color: #f3f3f3; border-radius: 5px; width: 100%; height: 20px; margin-top: 10px;}',
                '#BMprogressBar {height: 100%; width: 0; background-color: #4caf50; border-radius: 5px;}',
                '#BMprogressText {margin-top: 5px;}',
                '#BMoverlay #BMfooter {margin: 15px 0 0 0; font-size: 10px; color: #555;}',
                '#BMoverlay #BMfooter a, #BMoverlay #BMfooter a:visited {color: black; text-decoration: underline; color: #555;}'
              ];

        if(~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//)){
            search = "google"
        }

        async function get_visible_elements(path){
            let elements = document.querySelectorAll(path);
            return Array.from(elements).filter(el => {
                const rect = el.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            });
        }


        async function google_image(n){
            let results = [];
            let scrap = await get_visible_elements("div[id='search'] div[data-lpage]");

            for (let i = 0; i < scrap.length; i++) {
                let ele = scrap[i],
                    image_box = ele.querySelector("div[jsslot] g-img>img"),
                    image = image_box.getAttribute("src"),
                    width = image_box.getAttribute("width"),
                    height = image_box.getAttribute("height"),
                    url = ele.querySelector("div>span").textContent,
                    desc = image_box.getAttribute("alt");
                
                results.push({
                    image: image,
                    url: url,
                    description: desc,
                    width: width,
                    height: height,
                    });

            }
            return results;
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

        // Monitor input query modifications
        artoo.$('input[type="search"]').on('selectionchange', function(ev) {
            query = ev.target.value;
            artoo.$("#BMquery").text(query);
        });
  
        // In-page popup injection
        artoo.$('body').append(
          '<style>' + styles.join('\n') + '</style>' +
          '<div id="BMoverlay">' +
            '<h1>SearchEngineBookmarklets</h1>' +
            '<img id="BMlogo" src="https://medialab.github.io/SearchEnginesBookmarklet/images/duckduckgo-google-bing-baidu-256.png" alt="SEB logo" />' +
            '<h2>Extract ' + search + ' results</h2>' +
            '<p>Search for «&nbsp;<b id="BMquery">' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>&nbsp;»</p>' +
            '<p>How many results to collect at most?' +
              '<input type="number" id="BMnumber" value="' + 100 + '"></input>' +
            '</p>' +
            '<p>The page will be automatically expanded until reaching desired number of results.<br/>' +
               'You might need to validate some CAPTCHA.</p>' +
            '<input class="BMdownload" type="button" value="Start download!"></input>' +
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
          const data = await google_image(n);
          updateProgress(data.length, data.length);
          saveAs(
            new Blob([artoo.writers.csv(data)],
                     {type: "text/plain;charset=utf-8"}),
            "img-" + search + "-results-" + query.replace(" ", "%20") + "-first" + data.length + ".csv"
          );
        });



    });
}).call(this);