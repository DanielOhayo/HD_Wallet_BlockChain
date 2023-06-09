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
