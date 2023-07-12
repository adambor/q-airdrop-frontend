# Q voucher token dispenser

Voucher generator. This script generates voucher QR codes and 

## Installation

Install dependencies

```
npm install
```

Set the URL of the frontend, so it can generate QR codes which directly open the web-app with the voucher code

```javascript
const frontendUrl = "http://localhost:3000/";
```

Generate vouchers.

```
npm start <voucher count>
```

You should copy storage/ folder to the backend directory, qrcodes/ directory contains generated QR code PNGs.
