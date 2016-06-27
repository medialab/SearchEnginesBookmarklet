# google-bookmarklets
extract list of results from a google page as csv with bookmarklets

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
