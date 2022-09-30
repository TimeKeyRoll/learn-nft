// SPDX-License-Identifier:MIT;
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/b se64.sol";
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicSvgNft  is ERC721{

    uint256 private s_tokenCounter;
    string private i_lowImageURI;
     string private i_highImageURI;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";

    constructor(string memory lowSvg, string meory highSvg)ERC721("Dynamic SVG NFT", "DSN"){
    s_tokenCounter=0;
    }


    function svgToImageURI(string memory svg)public pure returns (string memory){
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix,svgBase64Encoded));
    }
    

    function mintNft()public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter= s_tokenCounter+1;



    }
}
