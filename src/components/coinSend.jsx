import { useRef, useEffect, useState, useContext } from "react";
import { styles } from "../utils/styles";
import { sendETH, sendWETH, sendAVAX } from "../utils/lib";
import Context from "../utils/context";
import { price, round } from "../utils/utils";
import LayoutModal from "./layoutModal";
import { decryptObjectFromLocalStorage, decryptObject } from "../utils/storage";

export default function CoinSend({ address, symbol }) {
  const { state, dispatch } = useContext(Context);
  const [showModal, setShowModal] = useState(false);
  const addressRef = useRef();
  const amountRefC = useRef();
  const amountRefU = useRef();
  const nameRef = useRef();
  const passwordRef = useRef();

  useEffect(() => {
    addressRef.current.focus();
  }, []);

  const handleConfirm = (e) => {
    e.preventDefault();
    const wallet = decryptObjectFromLocalStorage(
      passwordRef.current.value,
      nameRef.current.value,
    );
    console.log("daniWallet = ", wallet);
    if (state.selectedCoin == "wETH") {
      console.log("dani in wETH");
      sendWETH(
        wallet.testnet.wETH.address,
        wallet.testnet.wETH.privateKey,
        addressRef.current.value,
        amountRefC.current.value,
      );
    }
    if (state.selectedCoin == "ETH") {
      console.log("dani in ETH");
      sendETH(
        wallet.mainnet.ETH.address,
        wallet.mainnet.ETH.privateKey,
        addressRef.current.value,
        amountRefC.current.value,
      );
    }

    if (state.selectedCoin == "AVAX") {
      console.log("dani in AVAX");
      sendAVAX(
        wallet.mainnet.AVAX.address,
        wallet.mainnet.AVAX.privateKey,
        addressRef.current.value,
        amountRefC.current.value,
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
    console.log("send");
  };

  const changeU = (e) => {
    amountRefC.current.value = round(
      e.target.value / price(state, null, true),
      6,
    );
  };

  const changeC = (e) => {
    amountRefU.current.value = round(
      e.target.value * price(state, null, true),
      2,
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div class="flex flex-col gap-1">
          <div class={styles.label}>Recepient</div>
          <div>
            <input
              type="text"
              class={styles.textInput}
              required
              ref={addressRef}
            />
          </div>
          <div class="grid grid-cols-5 gap-3">
            <div class="col-span-3">
              <div class={styles.label}>Amount in {symbol}</div>
              <div>
                <input
                  type="number"
                  class={styles.textInput + " truncate"}
                  required
                  ref={amountRefC}
                  min={0}
                  onInput={changeC}
                  step={0.000001}
                />
              </div>
            </div>
            <div class="col-span-2">
              <div class={styles.label}>Amount in USD</div>
              <div>
                <input
                  type="number"
                  class={styles.textInput}
                  required
                  ref={amountRefU}
                  min={0}
                  step={0.01}
                  onInput={changeU}
                />
              </div>
            </div>
          </div>
          <div class="mt-8 mb-2">
            <button type="submit" class={styles.button}>
              Submit transaction
            </button>
          </div>
        </div>
      </form>
      {showModal && (
        <LayoutModal close={() => setShowModal(false)}>
          <div class={styles.label}>Wallet name</div>
          <div>
            <input
              type="text"
              class={styles.textInput}
              required
              ref={nameRef}
            />
          </div>
          <div class={styles.label}>Password</div>
          <div>
            <input
              type="password"
              class={styles.textInput}
              required
              ref={passwordRef}
            />
          </div>
          <div class="mt-4 mb-2">
            <button type="submit" onClick={handleConfirm} class={styles.button}>
              Confirm
            </button>
          </div>
        </LayoutModal>
      )}
    </>
  );
}
