const { network } = require("hardhat")
const { DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

const GAS_PRICE_LINK = 1e9 // link per gas
const BASE_FEE = ethers.utils.parseEther("0.25") //"0.25"link is the premimum. its the fees in link token.
//it takes the fee to get us Random Number.

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const args = [BASE_FEE, GAS_PRICE_LINK]

    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        //or
        //if (developmentChains.includes(network.name)) {
        log("local network detected! deploying mocks.....")
        //deploy a mock with name of vrfcoordinatior..
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log("Mocks Deployed")
        log(
            "------------------------------------------------------------------"
        )
    }
}
module.exports.tags = ["all", "mocks", "custom"]
