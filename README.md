# Project description

Code for the project on Meta-Transactions using [OpenZeppelin Defender](https://openzeppelin.com/defender).

This project consists of a sample MinimalForwarder, ERC20, ERC20 with permit and ERC721 contracts. The project implements the following approaches for buying ERC721 with meta transactions where the user is not needed to possess Matic:

 #### Buy ERC721 with ERC20
  - User approves ERC721 to spend his ERC20 resources. In order to `MinimalForwarder` contract be made to execute the transaction from the `relayer`,  `signMetaTxRequest`(/app/src/eth/signer) function has to be invoked. `Relayer` pays for the transaction in Matic for the user.
  - User buys ERC721. MinimalForwarder contract executes transaction from the `relayer`, who pays for the transaction in Matic for the user, the price of the ERC721 is paid by the user, then user is transferred the ERC721.

 #### Buy ERC721 with ERC20 with Permit
  - User signs with permit with invocation of `signWithPermit`(/app/src/eth/signerPermit) in order to both `approve` and `buy` in one transaction. After generating the signature on the FE (meta-txs-OZ-defender/app), the parameters needed, are extracted and passed in order to be signed for the invocation of the function `signMetaTxRequest`(/app/src/eth/signer). The `MinimalForwarder` contract executes transaction `from` the `relayer`, who pays for the transaction in Matic for the user, the price of the ERC721 is paid by the user, then user is transferred the ERC721.

## Structure

- `app`: React code for the client dapp, bootstrapped with create-react-app.
- `autotasks/relay`: Javascript code for the meta-transaction relay, to be run as a Defender Autotask, compiled using rollup.
- `contracts`: Solidity code for the  ERC20, ERC20 with permit and ERC721 contracts, compiled with [hardhat](https://hardhat.org/).
- `scripts`: Custom scripts for common tasks, such as uploading Autotask code, signing sample meta-txs, etc.
- `src`: Shared code for signing meta-txs and interacting with the Forwarder contract.
- `test`: Tests for contracts and autotask.

## Scripts

- `yarn deploy`: Compiles and deploys the Registry and Forwarder contracts to xDAI, and writes their addresses in `deploy.json`.
- `yarn sign`: Signs a meta-tx requesting the registration of `NAME`, using the private key defined in `PRIVATE_KEY`, and writes it to `tmp/request.json`.
- `yarn events`: Lists all the `Registered` events from the deployed contract on xDAI.
- `yarn invoke`: Invokes the relay Autotask via `WEBHOOK_URL` with the contents of `tmp/request.json` generated by `yarn sign`.
- `yarn upload`: Compiles and uploads the Autotask code to `AUTOTASK_ID`.
- `yarn relay`: Runs the relay Autotask script locally, using the Defender Relayer for `RELAY_API_KEY`.
- `yarn test`: Runs tests for contracts and Autotask using hardhat.

## Environment

Expected `.env` file in the project root:

- `PRIVATE_KEY`: Private key used for deploying contracts and signing meta-txs locally.
- `RELAYER_API_KEY`: Defender Relayer API key, used for sending txs with `yarn relay`.
- `RELAYER_API_SECRET`: Defender Relayer API secret.
- `AUTOTASK_ID`: Defender Autotask ID to update when running `yarn upload`.
- `TEAM_API_KEY`: Defender Team API key, used for uploading autotask code.
- `TEAM_API_SECRET`: Defender Team API secret.
- `API_KEY`: Etherscan API key.

Expected `.env` file in `/app`:

- `REACT_APP_WEBHOOK_URL`: Webhook of the Autotask to invoke for relaying meta-txs.

## Run the code

To run the workshop code yourself on the xDai network you will need to [sign up to Defender](https://defender.openzeppelin.com/) and [apply for mainnet access](https://openzeppelin.com/apply/), or change the code to use a public testnet.

### Configure the project

Create a `.env` file in the project root

```js
PRIVATE_KEY="Private key used for deploying contracts and signing meta-txs locally"
RELAYER_API_KEY="Defender Relayer API key, used for sending txs with yarn relay"
RELAYER_API_SECRET="Defender Relayer API secret"
AUTOTASK_ID="Defender Autotask ID to update when running yarn upload"
TEAM_API_KEY="Defender Team API key, used for uploading autotask code"
TEAM_API_SECRET="Defender Team API secret"
API_KEY="Etherscan API key"
```

Store the value of a new private key in our projects `.env` file and fund the address with xDai (You can use a [faucet](https://blockscout.com/poa/xdai/faucet)).

### Deploy contracts

Deploy the MinimalForwarder, ERC20, ERC20 with permit and ERC721 contracts to Mumbai.

```js
$ yarn deploy
```

### Create Relayer

Create a relayer using [Defender Relay](https://docs.openzeppelin.com/defender/relay) on Mumbai.
Fund your Mumbai relayer.
Create an API key for your relayer and store the relayer API key and API secret in our projects `.env` file.

### Create Autotask

Create an [Autotask in Defender](https://docs.openzeppelin.com/defender/autotasks), with a webhook trigger and connected to our Mumbai relayer.  We can leave the code as is as we will update it using a script.

Once the Autotask is created get the Autotask ID from the URL (https://defender.openzeppelin.com/#/autotask/[AUTO_TASK_ID]) and store it in our projects `.env` file.

To update our Autotask we need a Team API key.  From the right hand menu in Defender, select Team API Keys, then Create API Key, with Capabilities to Update Autotasks code and a note such as *Update Autotask code*.  Copy the Team API key and secret and store it in our projects `.env` file.

We can then update our Autotask code programmatically by uploading our code:

```js
$ yarn upload
```

We can sign another name for the registry and then send a request to the Autotask webhook to relay and finally view the registry.

```js
$ QTY=1 yarn sign
$ curl -XPOST 'Your Autotask Webhook URI goes here' -H 'Content-type: application/json' -d '@tmp/request.json'
$ yarn events
```

### Run app

Copy the Autotask Webhook URI and store in our apps `.env` file (in the `app` directory).

We can then install dependencies using `yarn` and run the app.

```js
$ yarn
$ yarn start
```

1. Open app: [http://localhost:3000/](http://localhost:3000/)
2. [Connect MetaMask to Mumbai network] and change to Mumbai network.
3. Enter a quantity to be bought and execute `approve`, `buy` or `buy with permit`.
4. Your purchase will be made, showing the address that created the meta transaction and the token IDs of the corresponding ERC721 tokens.
