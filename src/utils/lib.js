import { ethers } from 'ethers'
import { coinList, coinsListTest } from './coinList'
import { getBalances, getTickers, getBalancesGe } from "./data"


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
    // default testnet accounts
    // const wBTC = CreateWalletTest("wBTC", ETH.address, ETH.privateKey)
    const wETH = CreateWalletTest("wETH", ETH.address, ETH.privateKey)
    // const wUSD = CreateWalletTest("wUSD", ETH.address, ETH.privateKey)

    return {
        mnemonic,
        name: name,
        mainnet: {
            "AVAX": AVAX,
            "ETH": ETH
        },
        testnet: {
            // "wBTC": wBTC,
            "wETH": wETH,
            // "wUSD": wUSD
        }
    }
}

export const setWalletAndFetchData = (wallet, dispatch, cb = () => { }) => {
    // Alex testnet only
    getBalances(wallet.mainnet.ETH.address).then(balances => {
        getTickers().then(tickers => {
            // let b = Object.entries(balances).reduce((acc, [key, v]) => {
            //     //const key = k.substring(1) // for testnet only
            //     if (tickers[key]) {
            //         acc += v * parseFloat(tickers[key].p)
            //     }
            //     return acc
            // }, 0)
            // const balance = b.toLocaleString('en-US', { maximumFractionDigits: 2 })
            // const balance = getBalancesGe(wallet.mainnet.ETH.address)
            // const wEthBalances = getBalances(wallet.mainnet.ETH.address)
            // console.log("dani in setWalletAndFetchData= " + balance)
            dispatch({ type: 'SET_ALL', param: { wallet, tickers } })
            cb()
        })
    })
    // goerli

}

//setting page - if have password - 12 wored
export const send = async () => {
    const privateKey = "***********" // private key
    //const sender = "***"  // address
    const recipientAddress = "0xFc21E7316AC1453d4Ec99a9EaeD7d7a3BC03E879"
    const wallet = new ethers.Wallet(privateKey)
    const networkUri = "https://net.mtw-testnet.com" //
    const provider = new ethers.providers.JsonRpcProvider(networkUri)

    const amount = '1.0'
    const value = ethers.utils.parseEther(amount)

    const tx = {
        to: recipientAddress,
        value: value, //.mul(ethers.constants.WeiPerEther), 
        //nonce: nonce,
        gasLimit: 21000,
        gasPrice: ethers.BigNumber.from("20000000000"),
        chainId: 12345
    }
    //const number =  ethers.BigNumber.from("20000000000"),

    console.log(tx)
    //return
    const signedTransaction = wallet.signTransaction(tx)
    const txHash = await provider.sendTransaction(signedTransaction)
    console.log(`Transaction hash: ${txHash}`)
}