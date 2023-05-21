import { styles } from "../utils/styles.js"
import { useContext } from "preact/hooks"
import Context from "../utils/context"
import Router, { route } from 'preact-router'

export default function Home() {
    const { state, dispatch } = useContext(Context)
    return (<div class="ml-8 mt-8 flex flex-col gap-2">
        <div class={styles.link} onClick={() => dispatch({ type: 'SET_VIEW', param: 'existing' })}>Open existing wallet</div>
        <div class={styles.link} onClick={() => dispatch({ type: 'SET_VIEW', param: 'create' })}>Create new wallet</div>
        <div class={styles.link} onClick={() => dispatch({ type: 'SET_VIEW', param: 'restore' })}>Import wallet by mnemonic phrase</div>
    </div>)
}

{/*<div class={styles.link} onClick={() => route('/existing')}>Open existing wallet</div>
<div class={styles.link} onClick={() => route('/create')}>Create new wallet</div>
<div class={styles.link} onClick={() => route('/create')}>Import wallet by mnemonic phrase</div>*/}

{/* */ }

{/*<Router>
        <div class={styles.link} path='/existing'>Open existing wallet</div>
        <div class={styles.link} path='/create'>Create new wallet</div>
        <div class={styles.link} path='/create'>Import wallet by mnemonic phrase</div>
    </Router>*/}