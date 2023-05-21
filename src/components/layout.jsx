import { useState, useEffect, useContext } from 'react'
import { styles } from "../utils/styles"
import Context from "../utils/context"
import Error from "./error"
import * as storage from "../utils/storage"
import DashboardTitle from './dashboardTitle'

export default function Layout({ children }) {
    const { state, dispatch } = useContext(Context)
    const [title, setTitle] = useState("Welcome to HD Wallet!")

    useEffect(() => {
        const w = storage.getTempWallet()
        if (w) {
            dispatch({ type: 'SET_VIEW', param: 'dashboard' })
            setTitle(`<span class='text-gray-400'>Wallet:</span><span>${w.name}</span>`)
        } else {
            dispatch({ type: 'SET_VIEW', param: 'home' })
        }
    }, [])

    useEffect(() => {
        if (state.error !== '') {
            const timer = setTimeout(() => {
                dispatch({ type: 'SET_ERROR', param: '' })
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [state.error])

    return (
        <div class="w-[400px] min-h-[700px] sm:my-10 mx-auto lg:border-2 border-gray-400 rounded-lg lg:shadow-lg p-0 flex flex-col">
            <div class="text-red-700 font-bold text-xl mb-4 lg:bg-gray-100 px-8 py-4 rounded-tl-lg rounded-tr-lg">
                {
                    state.wallet ? <DashboardTitle /> : 'Welcome to HD Wallet!'
                }
            </div>

            <div class="grow overflow-y-auto overflow-x-hidden mx-8">
                {children}
                {state.error && <div class="relative h-8">
                    <Error text={state.error} />
                </div>}
            </div>
            <div class="px-8 py-4">
                {state.view === 'dashboard' ? <div class={styles.link} onClick={() => dispatch({ type: 'EXIT' })}>exit wallet</div> :
                    (state.view !== 'home' && state.view !== 'dashboard' && <div class={styles.link} onClick={() => dispatch({ type: 'SET_VIEW', param: 'home' })}>back home</div>)}
            </div>
        </div>
    )
}