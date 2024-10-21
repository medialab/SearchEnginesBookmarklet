(async function () {
    artoo.injectScript("//cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js", function() {
        function createPopup() {
            const popup = document.createElement("div");
            popup.style.position = "fixed";
            popup.style.top = "50%";
            popup.style.right = "0%";
            popup.style.transform = "translate(-50%, -50%)";
            popup.style.backgroundColor = "white";
            popup.style.border = "1px solid black";
            popup.style.padding = "20px";
            popup.style.zIndex = "10000";
            popup.style.display = "flex";
            popup.style.flexDirection = "column";
            popup.style.alignItems = "center";
            popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

            const title = document.createElement("h2");
            title.textContent = "DuckDuckGo bookmarklet";
            title.style.margin = "0";

            popup.appendChild(title);

            const select = document.createElement("select");
            const options = [10, 20, 50, 100, 1000];
            options.forEach(optionValue => {
                const option = document.createElement("option");
                option.value = optionValue;
                option.textContent = optionValue;
                select.appendChild(option);
            });
            select.style.padding = "10px";
            select.style.margin = "10px";
            popup.appendChild(select);

            const button = document.createElement("button");
            button.textContent = "Lancer le scraping";
            
            button.onclick = async function () {
                const n = parseInt(select.value, 10);
                const data = await scrape(n);
                artoo.saveCsv(data);
                document.body.removeChild(popup);
            };
            button.style.padding = "10px";
            button.style.margin = "10px";
            popup.appendChild(button);
            document.body.appendChild(popup);
        }

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
            console.log(results)
            return results;
        }
        createPopup();
    });
})();