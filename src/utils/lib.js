import { ethers } from 'ethers'
import { coinList, coinsListTest } from './coinList'
import { getBalance, getTickers } from "./data"
export const fixedGasLimit = 80000


const derivationPath = {
    ADA: "m/1852'/1815'/0'/",
    AVAX: "m/44'/9000'/0'/",
    BTC: "m/44'/0'/0'/",
    BCH: "m/44'/145'/0'/",
    BNB: "m/44'/714'/0'/",
    DASH: "m/44'/5'/0'/",
    DOGE: "m/44'/3'/0'/",
    DOT: "m/44'/354'/0'/",
    EOS: "m/44'/194'/0'/",
    ETH: "m/44'/60'/0'/",
    LTC: "m/44'/2'/0'/",
    MATIC: "m/44'/60'/0'/",
    SOL: "m/44'/501'/0'/",
    Celo: "m/44'/52752'/0'/"
}

export const CreateMnemonic = async () => {
    const randomWallet = ethers.Wallet.createRandom()
    return randomWallet.mnemonic.phrase
}

export const CreateWallet = async (coin, mnemonic, index = 0) => {
    if (!mnemonic) mnemonic = await CreateMnemonic()

    const path = `${derivationPath[coin]}0/${index}`

    const wallet = ethers.Wallet.fromMnemonic(mnemonic, path)
    const privateKey = wallet.privateKey
    //const publicKey = wallet.publicKey
    const address = wallet.address

    const coinInfo = coinList[coin]
    return { coinInfo, address, privateKey }
}

export const CreateWalletTest = (coin, address, privateKey) => {
    const coinInfo = coinsListTest[coin]
    return { coinInfo, address, privateKey }
}

export const CreateWallets = async (name) => {
    const mnemonic = await CreateMnemonic()
    return await RestoreWallets(name, mnemonic)
}

export const RestoreWallets = async (name, mnemonic) => {
    // default mainnet accounts
    const AVAX = await CreateWallet("AVAX", mnemonic)
    const ETH = await CreateWallet("ETH", mnemonic)
    // default testnet account
    const wETH = CreateWalletTest("wETH", ETH.address, ETH.privateKey)
    console.log("dani private key = " + ETH.privateKey)
    return {
        mnemonic,
        name: name,
        mainnet: {
            "AVAX": AVAX,
            "ETH": ETH
        },
        testnet: {
            "wETH": wETH,
        }
    }
}

export const setWalletAndFetchData = (wallet, dispatch, cb = () => { }) => {
    // Alex testnet only
    console.log(wallet)
    getBalance('mtw', 'wETH', wallet.mainnet.ETH.address).then(balances => {
        getTickers().then(tickers => {
            dispatch({ type: 'SET_ALL', param: { wallet, tickers } })
            cb()
        })
    })
    // goerli
}

export const sendWETH = async (sender, privateKey, recipient, amount, fee, cb = console.log) => {
    const provider = new ethers.providers.JsonRpcProvider(coinsListTest["wETH"].app)
    if (!fee) {
        const f = await getFee("wETH", sender, recipient, amount)
        fee = { gasLimit: f[1], gasPrice: f[0].recommended }
    }
    const wallet = new ethers.Wallet(privateKey)
    const value = ethers.utils.parseEther(amount)
    const nonce = await provider.getTransactionCount(sender, "latest")

    const tx = {
        to: recipient,
        value: value,
        nonce: nonce,
        gasPrice: fee.gasPrice,
        gasLimit: fee.gasLimit,
        chainId: (await provider.getNetwork()).chainId
    }
    const signedTransaction = await wallet.signTransaction(tx)
    cb({ type: 'SET_TRANSACTION_START' })
    provider.sendTransaction(signedTransaction)
        .then(tr => {
            cb({ type: 'SET_TRANSACTION_STATUS', param: 'pending' })
            trackTransactionStatus("wETH", tr.hash, cb)
        })
}

export const sendETH = async (sender, privateKey, recipient, amount, fee, cb = console.log) => {
    console.log(coinList["ETH"])
    const provider = new ethers.providers.JsonRpcProvider(coinList["ETH"].app)

    if (!fee) {
        const f = await getFee("ETH", sender, recipient, amount)
        fee = { gasLimit: f[1], gasPrice: f[0].recommended }
    }
    const wallet = new ethers.Wallet(privateKey)
    const value = ethers.utils.parseEther(amount)
    const nonce = await provider.getTransactionCount(sender, "latest")

    const tx = {
        to: recipient,
        value: value,
        nonce: nonce,
        gasPrice: fee.gasPrice,
        gasLimit: fee.gasLimit,
        chainId: (await provider.getNetwork()).chainId
    }
    const signedTransaction = await wallet.signTransaction(tx)
    cb({ type: 'SET_TRANSACTION_START' })
    provider.sendTransaction(signedTransaction)
        .then(tr => {
            cb({ type: 'SET_TRANSACTION_STATUS', param: 'pending' })
            trackTransactionStatus("ETH", tr.hash, cb)
        })
}

export const sendAVAX = async (sender, privateKey, recipient, amount, fee, cb = console.log) => {
    const provider = new ethers.providers.JsonRpcProvider(coinList["AVAX"].app)
    if (!fee) {
        const f = await getFee("AVAX", sender, recipient, amount)
        fee = { gasLimit: f[1], gasPrice: f[0].recommended }
    }
    const wallet = new ethers.Wallet(privateKey)
    const value = ethers.utils.parseEther(amount)
    const nonce = await provider.getTransactionCount(sender, "latest")
    const tx = {
        to: recipient,
        value: value,
        nonce: nonce,
        gasPrice: fee.gasPrice,
        gasLimit: fee.gasLimit,
        chainId: (await provider.getNetwork()).chainId
    }

    const signedTransaction = await wallet.signTransaction(tx)
    cb({ type: 'SET_TRANSACTION_START' })
    provider.sendTransaction(signedTransaction)
        .then(tr => {
            cb({ type: 'SET_TRANSACTION_STATUS', param: 'pending' })
            trackTransactionStatus("AVAX", tr.hash, cb)
        })
}

export const getFee = async (symbol, sender, recipient, amount) => {
    let provider
    if (symbol === "wETH") {
        provider = new ethers.providers.JsonRpcProvider(coinsListTest[symbol].app)
    }
    else {
        provider = new ethers.providers.JsonRpcProvider(coinList[symbol].app)
    }

    let gasPr = await provider.getGasPrice()
    const gasPrice = {
        economy: gasPr,
        recommended: gasPr.mul(ethers.BigNumber.from(2)),
        priority: gasPr.mul(ethers.BigNumber.from(4))
    }

    let gasLimit
    if (symbol === "wETH" || symbol === "ETH") {
        const value = ethers.utils.parseEther(amount)
        gasLimit = await provider.estimateGas({
            from: sender,
            to: recipient,
            value: value
        })
    } else { // ERC20 tokens        
        gasLimit = fixedGasLimit
    }

    return [gasPrice, gasLimit]
}

const trackTransactionStatus = async (symbol, transactionHash, cb = console.log) => {
    let provider
    if (symbol === "wETH") {
        provider = new ethers.providers.JsonRpcProvider(coinsListTest[symbol].app)
    }
    else {
        provider = new ethers.providers.JsonRpcProvider(coinList[symbol].app)
    }

    let newTransaction = true
    // Wait for the transaction to be mined and confirmed
    const receipt = await provider.waitForTransaction(transactionHash)
    console.log("Transaction confirmed:", receipt.transactionHash)

    // Retrieve the transaction details from the receipt
    console.log("Block number:", receipt.blockNumber)
    console.log("Gas used:", receipt.gasUsed.toString())

    // Listen for transaction events
    provider.on(transactionHash, (transaction) => {
        console.log("Transaction status:", transaction.status)
    })

    // Listen for confirmation events
    provider.on("block", (blockNumber) => {
        if (newTransaction)
            cb({ type: 'SET_TRANSACTION_STATUS', param: 'confirmed' })
        newTransaction = false
    })
}