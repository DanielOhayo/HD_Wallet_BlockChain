
export const showPopup = (message,topPosition) => {
    // Create a popup message element
    const popup = document.createElement('div')
    popup.className = 'popup'
    popup.textContent = message //'QR code copied to clipboard'
    if(topPosition) popup.style.top = `${topPosition}px`

    // Append the popup to the body
    document.body.appendChild(popup)

    // Remove the popup after a certain duration (e.g., 2 seconds)
    setTimeout(() => {
        popup.remove()
    }, 2000)
}

export const price = (state,sym,num) => {    
    if(!sym) sym = state.selectedCoin 
    const s = state.testnet ? sym.substr(1) : sym
    if (sym === 'wUSD') {
        return 1
    } else if (state.tickers && state.tickers[s]) {
        return num ? state.tickers[s].p : (parseFloat(state.tickers[s].p)).toLocaleString('en-US', {maximumFractionDigits:2})
    } else {
        return ''
    }
}

export const change = (state,sym) => {
    if(!sym) sym = state.selectedCoin 
    if(sym==='wUSD')return {color:'',change:''}    
    const s = state.testnet ? sym.substr(1) : sym
    if (state.tickers && state.tickers[s]) {
        let ch = parseFloat(state.tickers[s].c)
        let color = ''
        let sn = ''
        if (ch != 0) {
            color = ch > 0 ? 'text-green-500' : 'text-red-500'
            sn = ch > 0 ? '+' : ''
        }
        return { color, change: sn + ch + '%' }
    } else {
        return {color:'',change:''}
    }
}

export const cost = (state,sym) => {
    if(!sym) sym = state.selectedCoin 
    const c = state.balances[sym] * price(state,sym,true)
    return c.toLocaleString('en-US', {maximumFractionDigits:2})
}

export const round = (value, decimals) => {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals)
  }