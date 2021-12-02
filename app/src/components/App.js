import { EthereumContext } from '../eth/context';
import { createProvider } from '../eth/provider';
import { createInstance as erc20Factory } from '../eth/erc20Factory';
import { createInstance as erc20PermitFactory } from '../eth/erc20PermitFactory';
import { createInstance as erc721MetaFactory } from '../eth/erc721MetaFactory';

import './App.css';
import Purchases from './Purchases';
import ERC721Meta from './ERC721Meta';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const provider = createProvider();
  const erc20Contract = erc20Factory(provider);
  const erc20PermitContract = erc20PermitFactory(provider);
  const erc721MetaContract = erc721MetaFactory(provider);
  const ethereumContext = { provider, erc20Contract, erc20PermitContract, erc721MetaContract };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Meta-txs buy ERC721</h1>
      </header>
      <section className="App-content">

        <EthereumContext.Provider value={ethereumContext}>
          <ERC721Meta />
          <Purchases />
        </EthereumContext.Provider>

      </section>
      <ToastContainer hideProgressBar={true} />
    </div>
  );
}

export default App;
