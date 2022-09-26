const networkConfig = {
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",

        gasLane:
            "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: "1326",
        callbackGasLimit: "500000",

        mintFee: "100000000000000000", //0.01
    },
    31337: {
        name: "localhost",

        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        mintFee: "10000000000000000", // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
    },
}
const developmentChains = ["hardhat", "localhost"]
const DECIMALS = "18"
const INITIAL_ANSWER = "200000000000000000000"

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
