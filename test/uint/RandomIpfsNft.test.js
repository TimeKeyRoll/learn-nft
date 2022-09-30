const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")
const { basename } = require("path")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random NFT unit testing", function () {
          const chainId = network.config.chainId

          let vrfCoordinatorV2Mock, deployer, randomIpfsNft

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "RandomIpfsNft"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock"
              )
          })

          //https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/2945
          describe("Constructor", () => {
              it("sets staring values Correctly", async function () {
                  const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0)
                  const isIntialised = await randomIpfsNft.getInitialized()
                  assert(dogTokenUriZero.includes("ipfs://")) //?
                  assert.equal(isIntialised, true)
              })
          })

          describe("requestNFT", () => {
              it("fails if payment is not sent with the request ", async function () {
                  await expect(
                      randomIpfsNft.requestNft()
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreEthSent"
                  )
              })

              /**
               * getMintFee = i_mintFee which is mintFee and that's defined in `helper-hardhat`
               * we take that fee and minus some fee to check if mint fee value is less and if it returs error.
               *
               */
              it("reverts if payment amount is less than the MintFee", async function () {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(
                      randomIpfsNft.requestNft({
                          value: mintFee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreEthSent"
                  )
              })

              it("emits an event and kicks off a random word request", async function () {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(
                      randomIpfsNft.requestNft({ value: mintFee.toString() })
                  ).to.emit(randomIpfsNft, "NftRequested")
              })
          })
          describe("fulfillRandomWords", () => {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI("0")
                              const tokenCounter =
                                  await randomIpfsNft.getTokenCounter()
                              assert.equal(
                                  tokenUri.toString().includes("ipfs://"),
                                  true
                              )
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNft.getMintFee()
                          const requestNftResponse =
                              await randomIpfsNft.requestNft({
                                  value: fee.toString(),
                              })
                          const requestNftReceipt =
                              await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
          describe("getBreedFromModdedRng", () => {
              it("should return pug if moddedRng < 10", async function () {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRng(7)
                  assert.equal(0, expectedValue)
              })
              it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRng(21)
                  assert.equal(1, expectedValue)
              })
              it("should return st. bernard if moddedRng is between 40 - 99", async function () {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRng(77)
                  assert.equal(2, expectedValue)
              })
              it.only("should revert if moddedRng > 99", async function () {
                  await expect(
                      randomIpfsNft.getBreedFromModdedRng(100)
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })
      })
