// SPDX-License-Identifier:MIT;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
/**
 * @read mintNft function---
 * tokenId is based on the address which we have in the function.
 * If we have multiple tokens on one smart contract and each one of them need is speacial tokenId.
 * we have this `s_tokenCounter`which counts/adds the tokenID's. hence we have also intialized it
 * in `constructor` as `0`.
 * When we are using `_safeMint` function in ``mintNft` we need two parameters which are `address to`
 * and `tokenId`.tokenId would be ``s_tokenCounter` as decalared in state variable and counts `+1`.
 *
 * @read tokenUri(uri= universal resource identifier) function---
 * `tokenUri` returns `Uri` which is same as `Url`.
 * `tokenUri` returns `json` data in which it has - all the data of it.
 */

pragma solidity ^0.8.7;

contract BasicNft is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokenCounter;

    constructor() ERC721("Doggie", "Dog") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public view override returns (string memory) {
        return TOKEN_URI; //require (_exist(_tokenId))
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
