import { useContext, useState, useEffect, useRef } from "react";
import { EthereumContext } from "../eth/context";
import './Purchases.css';

const mapEvent = (event) => ({
  blockNumber: event.blockNumber,
  receiver: event.args.receiver,
  ids: event.args._mintedTokens,
  id: `${event.blockHash}/${event.transactionIndex}/${event.logIndex}`,
})

function Purchases() {
  const { erc721MetaContract, provider } = useContext(EthereumContext);
  const [purchases, setPurchases] = useState(undefined);
  const [blockNumber, setCurrentBlockNumber] = useState(0);
  const renderedRef = useRef(false);

  useEffect(() => {
    // Listen for newly mined block
    provider.on("block", (currBlockNumber) => {
      if (renderedRef.current == false) {
        setCurrentBlockNumber(currBlockNumber);
        renderedRef.current = true;
      } else if ((blockNumber + 1000 <= currBlockNumber) && (blockNumber != 0) && renderedRef.current) {
        setCurrentBlockNumber(currBlockNumber);
      }
    });
    // Filter by 'LogPurchased' event
    const filter = erc721MetaContract.filters.LogPurchased();

    const listener = (...args) => {
      const event = args[args.length - 1];
      setPurchases(rs => [mapEvent(event), ...rs || []]);
    };

    // RPC is limited to 1000 blocks in the past
    const from = blockNumber - 900;

    const subscribe = async () => {
      const past = await erc721MetaContract.queryFilter(filter, from);
      setPurchases((past.reverse() || []).map(mapEvent));
      erc721MetaContract.on(filter, listener);
    }

    subscribe()

    return () => erc721MetaContract.off(filter, listener);
  }, [erc721MetaContract, provider]);

  // Show buyer's address for each purchase, along with the token ids
  return <div className="Purchases">
    <h3>Last purchases</h3>

    {purchases === undefined && (
      <span>Loading..</span>
    )}

    {purchases && (
      <ul>
        {purchases.map((r, i) => (
          <li key={i} > <span className="address">{r.receiver}</span> {r?.ids?.map((m) => `${m} `)}</li>
        ))}
      </ul>
    )}
  </div >
}

export default Purchases;