const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pintaApikey = process.env.PINATA_API_KEY
const pintaSecretkey = process.env.PINATA_SECRET_KEY
const pinata = pinataSDK(pintaApikey, pintaSecretkey)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("Uploading to IPFS")
    for (fileIndex in files) {
        console.log(`working on ${fileIndex}.....`)
        const readableStreamForfile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        )
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForfile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}
module.exports = {
    storeImages,
    storeTokenUriMetadata,
}
