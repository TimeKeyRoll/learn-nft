const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    if (chainId == 31337) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }
    log("--------------------------------------------")
    const lowSVG = await fs.readFileSync("./images/dynamicNFT/frown.svg", {
        encoding: "utf8",
    })
    const highSVG = await fs.readFileSync("./images/dynamicNFT/happy.svg", {
        encoding: "utf8",
    })
    args = [ethUsdPriceFeedAddress, lowSVG, highSVG]

    const dynamicSvgNFT = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifyin....!")
        await verify(dynamicSvgNFT.address, args)
    }
}
module.exports.tags = ["all", "dynamicsvg", "custom"]
