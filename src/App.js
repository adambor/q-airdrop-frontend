import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import React, {useRef, useState} from "react";
import {Alert, Button, Card, Container, Navbar} from "react-bootstrap";
import ValidatedInput from "./components/ValidatedInput";

const Q_NETWORK = {
    chainId: "0x"+(35443).toString(16),
    chainName: "Q Testnet",
    nativeCurrency: {
        name: "Q Token",
        symbol: "QT",
        decimals: 18
    },
    blockExplorerUrls: ["https://explorer.qtestnet.org"],
    rpcUrls: ["https://rpc.qtestnet.org"]
};

async function usesRightChain(chain) {
    const res = await window.ethereum.request({
        method: 'eth_chainId'
    });

    return res===chain.chainId;
}

async function switchMetamaskToChain(chain) {
    if(await usesRightChain(chain)) return true;

    const chainId = chain.chainId;

    try {
        // @ts-ignore
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }]
        });
        return true;
    } catch (e) {
        try {
            // @ts-ignore
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [chain]
            });
            return true;
        } catch (addError) {
            console.error(addError);
        }
        //Metamask not installed, probably

    }
    return false;
}

function App() {

    const voucherRef = useRef();

    const [step, setStep] = useState(0);
    const [errorMessage, setErrorMessage] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [address, setAddress] = useState(null);

    const connectwalletHandler = async () => {
        setProcessing(true);
        setErrorMessage(null);
        try {
            // @ts-ignore
            if (window.ethereum) {
                const result = await window.ethereum.request({
                    method: "eth_requestAccounts"
                });
                console.log("Result: ", result);
                setAddress(result[0]);
                setProcessing(false);
                if(await usesRightChain(Q_NETWORK)) {
                    setStep(2);
                } else {
                    setStep(1);
                }
            } else {
                setErrorMessage("Please Install Metamask!!!");
            }
        } catch (e) {
            console.error(e);
            setErrorMessage("Failed to connect with metamask, please retry!")
        }
        setProcessing(false);
    };

    const switchToQ = async() => {
        setProcessing(true);
        setErrorMessage(null);
        try {
            if(await switchMetamaskToChain(Q_NETWORK)) {
                setStep(2);
            } else {
                setErrorMessage("Failed to switch network, please retry!");
            }
        } catch (e) {
            setErrorMessage("Failed to switch network, please retry! "+e.message);
        }
        setProcessing(false);
    };

    const claimToken = async() => {
        setErrorMessage(null);
        if(!voucherRef.current.validate()) {
            return;
        }
        setProcessing(true);
        try {
            const response = await fetch('https://node3.gethopa.com:34001/claim', {
                method: 'POST',
                body: JSON.stringify({
                    address,
                    voucher: voucherRef.current.getValue()
                }),
                headers: {
                    'Content-type': 'application/json',
                }
            });
            const data = await response.json();
            if(data.code===10000) {
                //Success
                setStep(3);
                return;
            }
            setErrorMessage(data.msg);
        } catch (e) {
            setErrorMessage("Failed to claim the tokens, please retry later!");
        }
        setProcessing(false);
    };

    return (
        <div className="App">
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="#home" className="fw-semibold">
                        Q Event Airdrop
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <header className="App-header text-black">
                <Card bg="light" className="mx-3">
                    <Card.Body>
                        {errorMessage!=null ? (<Alert variant="danger">
                            {errorMessage}
                        </Alert>) : ""}
                        {step===0 ? (
                            <>
                                <p>Connect your Metamask wallet to begin</p>
                                <Button disabled={processing} onClick={connectwalletHandler}>
                                    Connect
                                </Button>
                            </>
                        ) : step===1 ? (
                            <>
                                <p>Switch your Metamask to use Q Blockchain</p>
                                <Button disabled={processing} onClick={switchToQ}>
                                    Switch
                                </Button>
                            </>
                        ) : step===2 ? (
                            <>
                                <p>Input the voucher code below to claim your tokens!</p>
                                <ValidatedInput
                                    onValidate={(value) => value==null || value.length===0 ? "Cannot be empty" : null}
                                    inputRef={voucherRef}
                                    type="text"
                                    label={(
                                        <span className="fw-semibold">Voucher code</span>
                                    )}
                                    className="mb-2"
                                />
                                <Button disabled={processing} onClick={claimToken}>
                                    Claim
                                </Button>
                            </>
                        ) : step===3 ? (
                            <>
                                <Alert variant="success">
                                    <p>You have successfully claimed the tokens!</p>
                                </Alert>
                            </>
                        ) : ""}
                    </Card.Body>
                </Card>
            </header>
        </div>
    );
}

export default App;
