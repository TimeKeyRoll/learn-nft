// SPDX-License-Identifier:MIT;
pragma solidity ^0.8.7;
/**
 * @author we will change `svg` to `base64`
 * and can be used `onChain` for `image Uri`.
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValues;

    // event CreatedNFT(uint256 indexed tokenId, int256 highValue);
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_lowImageURI = svgToImageURI(lowSvg);
        s_highImageURI = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValues[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        //emit CreatedNFT(s_tokenCounter, highValue);
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    /**
     * we are switching our `tokenMetadata` into `base64`.
     * its because we already have `svg`(picture) data into `base64`.
     * `_exist` is the function of `ERC721`.
     * Doing `abi.enCoded` is gonna concatenate(link together in a chain) everything together.
     * this is gonna be basically a string which gonna looks like regulat `metadata`.
     * now to turn this into: base64
     * we gonna type cast into :bytes
     * we use `Base64.encode`//base64 is the contract and `encode` is the function of it.
     * will type cast as a string to return as a string.
     *
     * Basically what we are doing is :
     * creating a json string
     * we are encoded in bytes.
     * that way we can encode in `base64`.
     *
     */

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "URI query for non-exisent token!");

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageURI;
        if (price >= s_tokenIdToHighValues[tokenId]) {
            imageURI = s_highImageURI;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "',
                                name(),
                                '", "description":"AN NFT CHANGES BASED ON CHAINLINK FEED", ',
                                '"attributes": [{"trait_type": "coolness", "value":100}], "image":"',
                                imageURI,
                                '" }'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
