const { network, ethers } = require("hardhat")
const { developmentChains, networkconfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNft"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let tokenUris

    //get the IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId

    if (chainId == 31337) {
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId //?
    } else {
        vrfCoordinatorV2Address = networkconfig[chainId].vrfCoordinatorV2
        subscriptionId = networkconfig[chainId].subscriptionId
    }
    log("....................................................................")
    await storeImages("imagesLocation")

    // const args = [
    //     vrfCoordinatorV2Address,
    //     subscriptionId,
    //     networkconfig[chainId].gasLane,
    //     networkconfig[chainId].callbackGasLimit,
    //     //dogTokenUris,
    //     networkconfig[chainId].mintFee,
    // ]
}
//upload our code to pinata

async function handleTokenUris() {
    tokenUris = []

    //store the Image in IPFS
    //Store the METADATA in IPFS

    return tokenUris
}

module.exports.tags = {
     "randomIpfsNft", "custom"
}
