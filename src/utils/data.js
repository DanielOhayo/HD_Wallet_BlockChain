import { ethers } from "ethers"
const APP_TESTNET = "https://net.mtw-testnet.com"

export const getTickers = async () => {
    const url = "https://tickers.herokuapp.com/data"
    const res = await fetch(url)
    const data = await res.json()
    return data
}

export const getBalance = async (tp, symbol, address, provider = new ethers.providers.JsonRpcProvider(APP_TESTNET)) => {
    console.log("dani add = " + address)
    try {

        if (tp === 'mtw') {

            if (symbol === 'wETH') {

                const balance = await provider.getBalance(address)

                return parseFloat(ethers.utils.formatEther(balance))

            } else {

                const tokenAddress = coinListTest[symbol].address

                const abi = coinListTest[symbol].abi

                const tokenContract = new ethers.Contract(tokenAddress, abi, provider)

                const balance = await tokenContract.balanceOf(address)

                return parseFloat(ethers.utils.formatEther(balance))

            }
        }
    } catch (e) {
        console.log("getBalance error", e)
        return 0
    }
}

export const balance = async (symbol, address) => {
    return { sym: symbol, am: await getBalance('mtw', symbol, address) }
}

export const getBalancesGe = async (address) => {
    const uri = 'https://goerli.infura.io/v3/2ceb338b953b495aa1f3ad87c9657293'
    const provider = new ethers.providers.JsonRpcProvider(uri)
    const b = await provider.getBalance(address)
    const balance = ethers.utils.formatUnits(b, 'ether')
    return balance
}

export const getBalancesMain = async (address) => {
    const uri = 'https://avalanche-mainnet.infura.io/v3/2ceb338b953b495aa1f3ad87c9657293'
    const provider = new ethers.providers.JsonRpcProvider(uri)
    const b = await provider.getBalance(address)
    const balance = ethers.utils.formatUnits(b, 'ether')
    return balance
}
