const { assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

/**
 * @read !developmentChains.includes(network.name)
 * it means if it does not have `hardhat` and `localhost` we are not local testing
 * we are eiter on `testnet` or `mainnet` hence we would like to skip `uint` testing.
 */

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit Tests", function () {
          let basicNft, deployer
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["mocks", "BasicNft"])
              basicNft = await ethers.getContract("BasicNft")
          })
          describe("Construtor", () => {
              it("Initilizes the NFT Correctly.", async () => {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(name, "Doggie")
                  assert.equal(symbol, "Dog")
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
          /**
           * @read
           * while we mint we make a transaction
           * and waitin for the block to mine
           * hence token counter will hit `0+1`= `1` and count it.
           *
           */
          //https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/2760
          describe("Mint NFT", () => {
              it("Allows users to mint an NFT, and updates appropriately", async function () {
                  const txResponse = await basicNft.mintNft()
                  await txResponse.wait(1)
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
              })
          })
      })
