const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const {
    storeImages,
    storeTokenUriMetadata,
} = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNft"
const FUND_AMOUNT = "1000000000000000000000" //10link

let tokenUris = [
    "ipfs://QmVxbbPizNjNAivobiKt5owRtmp5n9KaPzsh5XYiyb6RTH",
    "ipfs://QmS1mWB1uRtxX4sQG8E2Bo3VPPsd3Ue6yy88MZ1xT2hKep",
    "ipfs://QmcxeKRK48mG4j8EEzz6hejmnVSsBqsCqjwgNQ4S5oewp8",
]

const metadataTemplate = {
    name: "",
    description: "",
    images: "",
    attributes: [
        {
            trait_type: "Cuteness",
            vaue: 100,
        },
    ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //get the IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId //?
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }
    log("....................................................................")

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("---------------------------")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifyin....!")
        await verify(randomIpfsNft.address, args)
    }
}
//upload our code to pinata

async function handleTokenUris() {
    tokenUris = []

    //store the Image in IPFS
    //Store the METADATA in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(
        imagesLocation
    )
    for (imageUploadResponsesIndex in imageUploadResponses) {
        //create metadata
        //upload metadata
        let tokenUriMetadata = { ...metadataTemplate }

        tokenUriMetadata.name = files[imageUploadResponsesIndex].replace(
            ".png",
            ""
        )
        tokenUriMetadata.description = `A Beautiful ${tokenUriMetadata.name} Horse!`

        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}......`)
        //store the json to Pinata/IPFS

        const metadataUploadResponse = await storeTokenUriMetadata(
            tokenUriMetadata
        )
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token Uris Uploaded. They are : ")
    console.log(tokenUris)

    return tokenUris
}

module.exports.tags = ["RandomIpfsNft", "main"]
