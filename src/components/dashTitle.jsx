import { useState, useContext, useEffect } from "preact/hooks";
import Context from "../utils/context";
import { price, change, cost } from "../utils/utils";
import { getBalancesGe, getBalance, getBalancesMain } from "../utils/data";
import * as storage from "../utils/storage";

export default function DashTitle() {
  const { state, dispatch } = useContext(Context);
  const [symbol, setSymbol] = useState("");

  const w = storage.getTempWallet();

  useEffect(() => {
    if (state.selectedCoin) {
      setSymbol(
        state.testnet ? state.selectedCoin.substr(1) : state.selectedCoin,
      );
    }
    getBalancesMain(w.mainnet["AVAX"].address).then((b) => {
      dispatch({ type: "SET_BALANCES_SYM", symbol: "AVAX", param: b });
    });
    getBalancesGe(w.mainnet["ETH"].address).then((b) => {
      dispatch({ type: "SET_BALANCES_SYM", symbol: "ETH", param: b });
    });
    getBalance("mtw", "wETH", w.testnet["wETH"].address).then((b) => {
      dispatch({ type: "SET_BALANCES_SYM", symbol: "wETH", param: b });
    });
  }, [state.selectedCoin]);
  return (
    <>
      <div class="mb-8 mt-4">
        {state.selectedCoin ? (
          <>
            <div>
              <div class="flex justify-center gap-1 text-sm pt-1 text-gray-400">
                <div>price:</div>
                <div class="flex justify-start gap-1">
                  <div class="font-bold">$ {price(state)}</div>
                  <div class={"font-bold " + change(state).color}>
                    {change(state).change}
                  </div>
                </div>
                <div>cost:</div>
                <div class="font-bold">$ {cost(state)}</div>
              </div>
              <div class="mb-0 flex justify-center gap-2 text-4xl">
                <div class="">
                  {parseFloat(state.balances[state.selectedCoin] ?? 0).toFixed(
                    2,
                  )}
                </div>
                <div class="text-xl pt-3 font-bold text-gray-500">
                  {state.selectedCoin}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            <div class="text-gray-400 mb-0 text-center">Balance</div>
            <div class="text-center text-4xl">
              ${" "}
              {state.balances
                ? state.testnet
                  ? parseFloat(state.balances["wETH"]).toFixed(2)
                  : (
                      parseFloat(state.balances["ETH"]) +
                      parseFloat(state.balances["AVAX"])
                    ).toFixed(2)
                : 0}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
