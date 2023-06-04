import { ethers } from "ethers"

export const getTickers = async () => {
    const url = "https://tickers.walletandchange.com/data"
    const res = await fetch(url)
    const data = await res.json()
    return data
}

export const getBalances = async (address) => {
    const url = `https://prev.morethanwallet.com/api/mtweth/ad/${address}/mtw`
    try {
        const res = await fetch(url)
        const data = await res.json()
        let result = null
        if (data && data.balances) {
            result = data.balances.reduce((acc, b) => {
                acc[b.sym] = b.am
                return acc
            }, {})
        }
        return result
    } catch (e) {
        console.log("fetch error", e)
        return null
    }
}

export const getBalancesGe = async (address) => {
    const uri = 'https://goerli.infura.io/v3/2ceb338b953b495aa1f3ad87c9657293'
    const provider = new ethers.providers.JsonRpcProvider(uri)
    const b = await provider.getBalance(address)
    const balance = ethers.utils.formatUnits(b, 'ether')
    console.log(balance)
    return balance
}

// export const getBalancesCELO = async (address) => {
//     const uri = 'https://celo-mainnet.infura.io/v3/2ceb338b953b495aa1f3ad87c9657293'
//     const provider = new ethers.providers.JsonRpcProvider(uri)
//     const b = await provider.getBalance(address)
//     const balance = ethers.utils.formatUnits(b, 'ether')
//     console.log(balance)
//     return balance
// }
