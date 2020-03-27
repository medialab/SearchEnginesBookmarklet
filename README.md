# Google Bookmarklets

Harvesting lists of urls, titles, dates and descriptions from a Google search query is a recurrent need in digital methods and a hardly automatable one because of Google's restrictions towards robots.
Google Bookmarklets are two small icons to drag and drop into your browser bookmarks bars to ease this:
- a first button allows to switch from a Google search results page to the searc engine's old version which returns 100 results per page;
- the second button then allows to download in one click these results as CSV, or to store them in the browser's memory and navigate to the next results page in order to download more results at once.

<img src="images/bookmarklets.png"/>

## Dev

```bash
# Install node dependencies
npm install express https http fs

# Create HTTPS key & certificate 
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem

# Run HTTPS server
node serve-https.js
```
