require('dotenv').config();
const express = require("express");
const cors = require('cors');
const fs = require("fs/promises");
const ethers = require("ethers");

const AIRDROP_AMOUNT = ethers.utils.parseEther(process.env.AIRDROP_AMOUNT);
const privateKey = process.env.EVM_PRIVATE_KEY;
const chainId = 35441;
const _client = new ethers.providers.StaticJsonRpcProvider("https://rpc.q.org", {
    name: "Q Mainnet",
    chainId: chainId
});

const wallet = new ethers.Wallet(privateKey, _client);

/*
await fs.rm(this.directory+"/"+paymentHash+".json");
await fs.readFile(this.directory+"/"+file);
await fs.writeFile(this.directory+"/"+hash+".json", JSON.stringify(cpy));
 */

const directory = "storage";
const locks = {};

let nonce;

async function main() {
    try {
        await fs.mkdir(directory)
    } catch (e) {}

    console.log("Using address: ", await wallet.getAddress());
    console.log("Airdrop amount: ", process.env.AIRDROP_AMOUNT)

    const app = express();
    app.use(cors());
    app.use(express.json());

    nonce = await _client.getTransactionCount(await wallet.getAddress(), "pending");

    app.post("/claim", async (req, res) => {

        /**
         * address: string          Address of the recipient
         * voucher: string          Voucher code to use
         */

	    console.log("Claim", req.body);

        if (
            req.body == null ||

            req.body.address == null ||
            typeof(req.body.address) !== "string" ||
            !ethers.utils.isAddress(req.body.address) ||

            req.body.voucher == null ||
            typeof(req.body.voucher) !== "string" ||
            req.body.voucher.length>100
        ) {
            res.status(400).json({
                msg: "Invalid request body (address/voucher)"
            });
            return;
        }

        try {
            await fs.readFile(directory+"/"+req.body.voucher+".json");
        } catch (e) {
            res.status(200).json({
                code: 10001,
                msg: "Voucher already used or doesn't exist"
            });
            return;
        }

        if(locks[req.body.voucher]) {
            res.status(200).json({
                code: 10002,
                msg: "Voucher is being redeemed"
            });
            return;
        }

        locks[req.body.voucher] = true;
        let failed = false;
        let txId = null;
        try {
            const useNonce = nonce;
            nonce++;
            const gasPrice = await _client.getGasPrice();
            const tx = {
                to: req.body.address,
                value: AIRDROP_AMOUNT,
                chainId: chainId,
                gasPrice: gasPrice,
                gasLimit: "0x"+(21000).toString(16),
                nonce: useNonce
            };
            const txObj = await wallet.sendTransaction(tx);
            txId = txObj.hash;
            await fs.rm(directory+"/"+req.body.voucher+".json");
        } catch (e) {
            failed = true;
            console.error(e);
        }
        delete locks[req.body.voucher];

        if(failed) {
            res.status(200).json({
                code: 10003,
                msg: "Failed to send transaction"
            });
            return;
        }
        res.status(200).json({
            code: 10000,
            msg: "Success",
            data: {
                txId
            }
        });
    });

    app.listen(parseInt(process.env.REST_PORT));
}

main();
