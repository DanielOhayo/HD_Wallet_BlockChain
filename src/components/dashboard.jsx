import { useState, useContext, useEffect } from "preact/hooks";
import Context from "../utils/context";
import * as storage from "../utils/storage";
import { styles } from "../utils/styles";
import { setWalletAndFetchData } from "../utils/lib";
import CoinTable from "./coinTable";
import CoinAction from "./coinAction";
import DashTitle from "./dashTitle";
import Loading from "./loading";
import { getBalancesGe, getBalance, getBalancesMain } from "../utils/data";

export default function Dashboard() {
  const { state, dispatch } = useContext(Context);
  const [firstDivClass, setFirstDivClass] = useState("");
  const [secondDivClass, setSecondDivClass] = useState("translate-x-full");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.isSelected) {
      setFirstDivClass("-translate-x-full");
      setSecondDivClass("");
    } else {
      setFirstDivClass("");
      setSecondDivClass("translate-x-full");
    }
  }, [state.isSelected]);

  useEffect(() => {
    const w = storage.getTempWallet();
    if (w) {
      //console.log(w)
      setLoading(true);
      setWalletAndFetchData(w, dispatch, () => {
        setLoading(false);
      });
      setInterval(() => {
        setWalletAndFetchData(w, dispatch);
      }, 30000);
      console.log(state);

      getBalancesMain(w.mainnet["AVAX"].address).then((b) => {
        dispatch({ type: "SET_MAINNET_BALANCES", param: b });
        dispatch({ type: "SET_BALANCES_SYM", symbol: "AVAX", param: b });
        console.log("getBalancesMain: " + b);
      });
      getBalancesGe(w.mainnet["ETH"].address).then((b) => {
        dispatch({ type: "SET_GOERLI_BALANCES", param: b });
        dispatch({ type: "SET_BALANCES_SYM", symbol: "ETH", param: b });
        console.log("getBalancesGe: " + b);
      });
      getBalance("mtw", "wETH", w.testnet["wETH"].address).then((b) => {
        dispatch({ type: "SET_TESTNET_BALANCES", param: b });
        dispatch({ type: "SET_BALANCES_SYM", symbol: "wETH", param: b });
        console.log("getBalance: " + b);
      });

      dispatch({
        type: "SET_BALANCE",
        param:
          parseFloat(state.balances["ETH"]) +
          parseFloat(state.balances["AVAX"]),
      });
    } else {
      dispatch({ type: "SET_VIEW", param: "home" });
    }
  }, []);

  return (
    <>
      {loading ? (
        <div class="flex justify-center mt-12">
          <Loading />
        </div>
      ) : (
        <>
          <DashTitle />
          <div className="relative">
            <div className="flex flex-start overflow-x-hidden">
              <CoinTable style={firstDivClass} />
              <CoinAction style={secondDivClass} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
