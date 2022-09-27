require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-deploy")
require("@nomiclabs/hardhat-ethers")

const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL || "https://eth-goerli/example"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "0x0000000000000000000000000000000000000000000000000000000000000000"
const PRIVATE_KEY2 =
    process.env.PRIVATE_KEY2 ||
    "0x0000000000000000000000000000000000000000000000000000000000000000"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const LOCAL_HOST_API = process.env.LOCAL_HOST_API || "key"
const COIN_MARKET_CAP_API = process.env.COIN_MARKET_CAP_API || "key"
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "key"
const RINKEBY_PRIVATE_KEY =
    process.env.RINKEBY_PRIVATE_KEY ||
    "0x0000000000000000000000000000000000000000000000000000000000000000"
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "key"

const POLYGON_PRIVATE_KEY =
    process.env.POLYGON_PRIVATE_KEY ||
    "0x0000000000000000000000000000000000000000000000000000000000000000"
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
module.exports = {
    //solidity: "0.8.8",
    solidity: {
        compilers: [
            { version: "0.8.7" },
            { version: "0.4.19" },
            { version: "0.6.12" },
            { version: "0.6.6" },
        ],
    },
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [RINKEBY_PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
        polygon: {
            url: POLYGON_RPC_URL,
            accounts: [POLYGON_PRIVATE_KEY],
            chainId: 80001,
            blockConfirmations: 6,
        },
        localhost: {
            url: LOCAL_HOST_API,
            //accounts:
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },

    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COIN_MARKET_CAP_API,
        token: "MATIC",
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
}
