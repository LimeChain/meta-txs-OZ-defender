import { useRef, useState, useContext } from 'react';
import { approve, buy, buyPermit, mint } from '../eth/erc721Meta';
import { EthereumContext } from "../eth/context";
import { toast } from 'react-toastify';
import './ERC721Meta.css';

function ERC721Meta() {
  const qtyInput = useRef(null);
  const [submitting, setSubmitting] = useState({
    approve: false,
    buy: false,
    buyPermit: false,
  });
  const { erc20Contract, erc20PermitContract, erc721MetaContract, provider } = useContext(EthereumContext);

  const sendTxApprove = async (event) => {
    event.preventDefault();
    const qty = qtyInput.current.value;
    setSubmitting(e => { return { ...e, approve: true } });

    try {
      const response = await approve(erc721MetaContract, erc20Contract, provider, qty);
      const hash = response.hash;
      const onClick = hash
        ? () => window.open(`https://mumbai.polygonscan.com/tx/${hash}`)
        : undefined;
      toast('Transaction sent!', { type: 'info', onClick });
      qtyInput.current.value = '';
    } catch (err) {
      toast(err.message || err, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  const sendTx = async (event) => {
    event.preventDefault();
    const qty = qtyInput.current.value;
    setSubmitting(e => { return { ...e, buy: true } });

    try {
      const response = await buy(erc721MetaContract, erc20Contract, provider, qty);
      const hash = response.hash;
      const onClick = hash
        ? () => window.open(`https://mumbai.polygonscan.com/tx/${hash}`)
        : undefined;
      toast('Transaction sent!', { type: 'info', onClick });
      qtyInput.current.value = '';
    } catch (err) {
      toast(err.message || err, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  const sendTxPermit = async (event) => {
    event.preventDefault();
    const qty = qtyInput.current.value;
    setSubmitting(e => { return { ...e, buyPermit: true } });
    try {
      const response = await buyPermit(erc721MetaContract, erc20PermitContract, provider, qty);
      const hash = response.hash;
      const onClick = hash
        ? () => window.open(`https://mumbai.polygonscan.com/tx/${hash}`)
        : undefined;
      toast('Transaction sent!', { type: 'info', onClick });
      qtyInput.current.value = '';
    } catch (err) {
      toast(err.message || err, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="Container">
    <div className="form">
      <input type='number' required={true} placeholder="Quantity" ref={qtyInput}></input>
      <button type="button" onClick={sendTxApprove} disabled={submitting.approve}>{submitting.approve ? 'Approving...' : 'Approve'}</button>
      <button type="button" onClick={sendTx} disabled={submitting.buy}>{submitting.buy ? 'Buying...' : 'Buy'}</button>
      <button type="button" onClick={sendTxPermit} disabled={submitting.buyPermit}>{submitting.buyPermit ? 'Buying Permit...' : 'Buy Permit'}</button>
    </div>
  </div>
}

export default ERC721Meta;