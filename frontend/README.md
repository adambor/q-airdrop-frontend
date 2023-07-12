# Q voucher token dispenser

This is a front-end part of the Q voucher token dispenser. It's a react web-app.

## Installation

Install dependencies

```
npm install
```

Set the URL of the running backend instance in App.js file

```javascript
const backendUrl = "https://node3.gethopa.com:34001"; //URL of the backend nodejs instance
```

Start dev server for testing.

```
npm run start
```

Once you checked it works, build the front-end.

```
npm run build
```

Build output is in build/ folder and can be readily served from any blob storage (such as azure, AWS or from an expressjs server).
