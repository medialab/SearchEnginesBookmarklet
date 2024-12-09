(async function(){
    artoo.injectScript("//medialab.github.io/SearchEnginesBookmarklet/FileSaver.min.js", function() {

      var loc = window.location,
        href = loc.href,
        query = (~href.search(/[#?&]q=/) ? href.replace(/^.*[#?&]q=([^#?&]+).*$/, '$1') : undefined),
        search = ~href.search(/:\/\/([^.]+\.)?google\.[^/]+\//) ? 'Google' : 'DuckDuckGo',
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

      async function getBase64FromImageURL(url) {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      async function scrap_n_results(n, path) {
        let scrap,
          pixel_scroll = 0,
          verif = true;
        scrap = Array.from(document.querySelectorAll(path));
        while(scrap.length < n || verif){
          pixel_scroll += Math.random()*2000 + Math.random()*500;
          window.scroll({top: pixel_scroll, left: 0, behavior: "smooth"});
          await wait(2000, 3000);
          scrap = Array.from(document.querySelectorAll(path));
          const lastElement = scrap[scrap.length - 1];
          const img = search === 'Google'
            ? lastElement.querySelector("div[jsslot] g-img > img") 
            : lastElement.querySelector("img[class]");
          
          verif = img && img.getAttribute("src").includes("data:image/gif;base64,");
        }
        return Array.from(scrap);
      }

      async function get_image(image_box){
        let image = image_box.getAttribute("src");
        if (!(~image.search("data:image/gif;base64,"))) {
          try {
            image = await getBase64FromImageURL(image);
          } catch (e) {
            let error = 'CORS protection detected!',
              popup = '\n\nTry to enforce it using a second browser extension such as the one that will open in a new tab (first allow it to pop-up).\n\nThen activate the extension, refresh the page and retry the bookmarklet.';
            if (navigator.userAgent.indexOf('Chrome') > -1) {
              window.alert(error + popup);
              window.open('https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=fr');
            } else if (navigator.userAgent.indexOf('Firefox') > -1) {
              window.alert(error + popup + '\n\n(you should use the \"Allow CORS\" option of the extension)');
              window.open('https://addons.mozilla.org/en-US/firefox/addon/mheadercontrol/');
            } else {
              window.alert(error + '\n\nThis bookmarklet is intended to work only within Firefox or Chrome/Chromium.\n\nPlease use one of these browsers and retry.');
            }
            throw(e);
          }
        }
        return image;
      }

      async function scrape(n){
        let results = [],
          box_path = search === 'Google' ? "div[id='search'] div[data-lpage]" : "div[class='tile  tile--img  has-detail']",
          scrap = await scrap_n_results(n, box_path),
          ele,
          verif = new Set();

        while ((ele = scrap.shift()) && results.length < n) {
          let path = search === 'Google' ? "div[jsslot] g-img>img":"img[class]",
            image_box = ele.querySelector(path),
            image_url = image_box.getAttribute("src").replace(/^data:image.*$/, '').replace(/^\/\//, 'https://'),
            image = await get_image(image_box),
            width = image_box.naturalWidth,
            height = image_box.naturalHeight;

          if (!verif.has(image)) {
            let url = ele.querySelector(search === 'Google' ? "div[jsaction]>a" : "a").href,
              desc = image_box.getAttribute("alt");
            results.push({
              image_url: image_url,
              source_url: url,
              image_base64: image,
              description: desc,
              width: width,
              height: height
            });
            verif.add(image);
          }

          updateProgress(results.length, n);
        }
        return results;
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
          '<h2>Extract ' + search + ' Images</h2>' +
          '<p>Search for «&nbsp;<b id="BMquery">' + decodeURIComponent(query.replace(/\+/g, '%20')) + '</b>&nbsp;»</p>' +
          '<p>How many results to collect at most?' +
            '<input type="number" id="BMnumber" value="100"></input>' +
          '</p>' +
          '<p>The page will be automatically expanded until reaching desired number of images.<br/>' +
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
        let data = await scrape(n);
        updateProgress(data.length, data.length);
        saveAs(
          new Blob([artoo.writers.csv(data)],
                   {type: "text/plain;charset=utf-8"}),
          search.toLowerCase() + "-images-results-" + query.replace(" ", "%20") + "-first" + data.length + ".csv"
        );
      });

    });
})();
