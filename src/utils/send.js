//import fs from 'fs-extra'
import { ethers } from 'ethers' //, { providers, Wallet }
import { coinListTest } from './coinList'
import { APP_TESTNET } from '../config'

const decimals = 18 // for all MTW supported tokens
export const fixedGasLimit = 80000
const provider = new ethers.providers.JsonRpcProvider(APP_TESTNET)

// mainnet ETH and testnet wETH and it's tokens only
export const getFee = async (symbol, sender, recipient, amount) => {
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

export const checkMaxAmount = async (balance) => {
    const gasPrice = await provider.getGasPrice()
    const balanceInWei = ethers.utils.parseEther(balance.toString())
    const gasLimit = ethers.BigNumber.from(fixedGasLimit.toString())

    const transactionCost = gasPrice.mul(gasLimit).mul(ethers.BigNumber.from(4))
    const maxTransactionAmountInWei = balanceInWei.sub(transactionCost)

    // Convert to ether
    const maxTransactionAmountInEther = ethers.utils.formatEther(maxTransactionAmountInWei)
    return maxTransactionAmountInEther
}

export const checkMinAmount = async () => {
    const gasPrice = await provider.getGasPrice()
    const gasLimit = ethers.BigNumber.from(fixedGasLimit.toString())
    const transactionCost = gasPrice.mul(gasLimit).mul(ethers.BigNumber.from(4))
    // Convert to ether
    return ethers.utils.formatEther(transactionCost)
}

// fee = {gasPrice, gasLimit}
export const sendETH = async (sender, privateKey, recipient, amount, fee, cb = console.log) => {
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

    //console.log(tx)
    const signedTransaction = await wallet.signTransaction(tx)
    //cb({status:'sent',param:tx}) 
    cb({ type: 'SET_TRANSACTION_START' })
    provider.sendTransaction(signedTransaction)
        .then(tr => {
            //cb({status:'pending',param:tr.hash})
            cb({ type: 'SET_TRANSACTION_STATUS', param: 'pending' })
            //console.log("Transaction sent:", tr.hash)
            trackTransactionStatus(tr.hash, cb)
        })
}

// fee = {gasPrice, gasLimit}
export const sendERC20 = async (symbol, sender, privateKey, recipient, amount, fee, cb = console.log) => {

    if (!fee) {
        const f = await getFee(symbol, sender, recipient, amount)
        fee = { gasLimit: f[1], gasPrice: f[0].recommended }
    }

    const wallet = new ethers.Wallet(privateKey)
    const { abi, address } = coinListTest[symbol]
    const tokenContract = new ethers.Contract(address, abi, wallet)

    // Calculate the token amount based on decimals
    const tokenAmount = ethers.utils.parseUnits(amount, decimals)

    const nonce = await provider.getTransactionCount(sender, "latest")

    const tx = {
        to: address,
        nonce: nonce,
        gasPrice: fee.gasPrice,
        gasLimit: fee.gasLimit,
        data: tokenContract.interface.encodeFunctionData("transfer", [recipient, tokenAmount]),
        chainId: (await provider.getNetwork()).chainId
    }

    //console.log(tx)
    const signedTransaction = await wallet.signTransaction(tx)
    //cb({status:'sent',param:tx})
    cb({ type: 'SET_TRANSACTION_START' })
    provider.sendTransaction(signedTransaction)
        .then(tr => {
            //cb({status:'pending',param:tr.hash})
            cb({ type: 'SET_TRANSACTION_STATUS', param: 'pending' })
            //console.log("Transaction sent:", tr.hash)
            trackTransactionStatus(tr.hash, cb)
        })
}


const trackTransactionStatus = async (transactionHash, cb = console.log) => {
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
        //console.log("Gas price:", transaction.gasPrice.toString())
        //console.log("Gas limit:", transaction.gasLimit.toString())
    })

    // Listen for confirmation events
    provider.on("block", (blockNumber) => {
        if (newTransaction)
            cb({ type: 'SET_TRANSACTION_STATUS', param: 'confirmed' })
        newTransaction = false
        //console.log("Block number:", blockNumber)
    })
}