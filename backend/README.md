# Q voucher token dispenser

This is a back-end part of the Q voucher token dispenser.

## How it works?

Backend controls a Q wallet and will send the set amount of Q tokens to anyone who can provide a valid voucher.

It uses files in storage/ folder to determine which vouchers are available (in format {voucher_code}.json, e.g. E87CAE.json). Everytime a voucher is used its corresponding file is removed so it cannot be used again.

To generate the JSON files along with QR code vouchers check the generator/ folder in this repo's root.

## Installation

Install dependencies

```
npm install
```

Rename the _.env file to .env

```
mv _.env .env
```

Set the private key (can be copied from e.g. metamask), and airdrop amount in .env file, you can also change the REST API port

```
EVM_PRIVATE_KEY="0x8db1a0a3ac7a2c8d2bcefc0ed77e6dc1c17de6b2a51f9ea304cb8ea6b004c718"
AIRDROP_AMOUNT="45"
REST_PORT="24001"
```

Start the server.

```
npm run start
```
