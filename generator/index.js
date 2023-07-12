const qr = require('qr-image');
const fs = require('fs');

const frontendUrl = "http://localhost:3000/";

const voucherCount = parseInt(process.argv[2]);
const VOUCHER_CHAR_LENGTH = 10;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

async function main() {
    if(fs.existsSync("storage/")) {
        fs.rmSync("storage/", {recursive: true, force: true});
    }
    if(fs.existsSync("qrcodes/")) {
        fs.rmSync("qrcodes/", {recursive: true, force: true});
    }

    fs.mkdirSync("storage/");
    fs.mkdirSync("qrcodes/");

    for(let i=0;i<voucherCount;i++) {
        const charArr = [];
        for(let e=0;e<VOUCHER_CHAR_LENGTH;e++) {
            charArr.push(ALPHABET.charAt(Math.floor(Math.random()*ALPHABET.length)));
        }
        const voucherCode = charArr.join("");

        fs.writeFileSync("storage/"+voucherCode+".json", voucherCode);

        const qrVoucher = qr.image(frontendUrl+'?code='+encodeURIComponent(voucherCode), { type: 'png' });
        qrVoucher.pipe(fs.createWriteStream("qrcodes/"+voucherCode+'.png'));
    }
}

main();