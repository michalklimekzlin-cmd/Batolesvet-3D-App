# VAFT Guardian — Jak nasadit (stručně)

1. Vlož do repa:
   - `vaft.message.shell.js`
   - `vaft.guardian.client.js`
   - `config/guardian-config.json`
   - `GUIDE.md`

2. Client: v `index.html` načti:
   ```html
   <script src="./vaft.message.shell.js"></script>
   <script src="./app.js"></script>
   <script src="./vaft.guardian.client.js"></script>
