//VRFCoordinatorV2Interface has `requesrRandomWords` function which create  `RandomNumber`.
//VRFConsumerBaseV2 has fucntion  `reuestFullFillment` which gets exceute after the random number is generated.
//ERC721URIStorage is the extension of `ERC721`.
//Ownable is the @openzepplin contracts which holds `modifiers` fucntion.

/**
 * @read when we mint a NFT we will trigger chainlink `vrf` to get us a random number.
 * using that number we will get a ranodm NFT.
 * ANd Random NFT could be either PUG,SHIBA INU Or SAINT BERNARD.
 * And each one of them would have different `rarity`.
 * Like pug: rare, shibaInu : sortOfRare, st.Beanrad: common.
 *
 * Users have to pay for minting.
 * ANd owner can withdrawl the users fund. (like artist is getting paid for his art work).
 *
 * //requestNFt is same as `requestRandomNumberWords`.
 *
 * We use `immutable` when we have to go through`constructor` to add data.
 *we use `constant` when we have data in `stateVariable` which cant be change after deployed.

 * //When we mint a NFT , we will trigger chainlink VRF to get us a random number.
//using that number we will get the NFT.
//Random NFT could be PUG,SHIBA INU, St. Bernard

//users have to pay to mint a 'nft`
//the owner can withdraw funds

//Interfaces needs to bedeclaed in state variables and inhertncingof the contract must be in contract Constructor.
//Since we have `VRFConsumerBaseV2` inheriteting so we also need to use its CONSTRUCTOR as per its Contract.
//since we are using `VRFCoordinatorV2Interface` we have to declare it as `StateVariable`.

//Now we have the `RandomNumber` but if we mint the nft in the `fullfillRandomNumber` then it will got to the `node`
//since node is calling that function.
//Instead of that we will create a mapping which will have ` address to requestId`. and have that impemented
//in `requestNFT` so it could save all the data.
// and we will use that mapping in `fullfillRandomWords` to make the `dogOwner`.
//
 */

// SPDX-License-Identifier:MIT;
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
//errorCumulativeSum
error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreEthSent();
error RandomIpfsNft__transferFailed();
error RandomIpfsNft__AlreadyInitialized();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //Type Declartion
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }
    //Chainlink State VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane; //keyhash
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //VRF helpers
    mapping(uint256 => address) public s_requestIdToSender;

    //NFT Variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;
    uint256 private immutable i_mintFee;
    bool private s_initialized;

    //EVENTS
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    //SINCE WE ARE INHERTING FROM `VRFConsumerBaseV2` and `ERC721` WE HAVE TO MENTION IN CONSTRUCTOR.
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        _initializeContract(dogTokenUris);
        i_mintFee = mintFee;
    }

    /**
     * @notice
     *`requestNft` is `requesRanodmWords` function.
     *requestId = i_vrfCoordinator.requestRandomWords explanation-->
     *we are calling ` requestRandomWords` function from `i_vrfCoordinator` which is
     *`VRFCoordinatorV2Interface`. while filling all the required function things at `Constructor`.
     * and whatever `info` we get after Calling the `requestRandomWords` is gonnabe the `requestId`.
     */

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreEthSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    /**
     * @notice Once we get the `randomNumber` we want to `fulfillRandomWords` function.
     * if we add this to fucntion  `_safeMint(msg.sender,s_tokenCounter`. it means whoever
     * call the `fulfillRandomWords` fucntion wil have NFt. ANd we dont want `node` to be the owner of the NFT>
     * so we'll create mapping with (reuquestId=>address).
     * we can fill `reuestId` to `fulfillRandomWords` parameters.
     *
     * for mingitng NFT we need the `owner` and `tokenId` whch we have.
     *
     * ` _setTokenURI` is a function of `ERC721` EXTENSIONS.
     *
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE; //modular and will get the no 1-99
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        s_tokenCounter += s_tokenCounter;
        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
        emit NftMinted(dogBreed, dogOwner);
    }

    function getChanceArray() public view returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    //this function is PRIVATE and its written for the test to be checked if everything
    //in constrictor works all good

    function _initializeContract(string[3] memory dogTokenUris) private {
        if (s_initialized) {
            revert RandomIpfsNft__AlreadyInitialized();
        }
        s_dogTokenUris = dogTokenUris;
        s_initialized = true;
    }

    //Video TImeStamp -21.13
    function getBreedFromModdedRng(uint256 moddedRng)
        public
        view
        returns (Breed)
    {
        uint256 CumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        //moddedRng=
        //i=
        //CumulativeSum=

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= CumulativeSum && moddedRng < chanceArray[i]) {
                return Breed(i);
            }
            CumulativeSum = chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__transferFailed();
        }
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }

    function getDogTokenUris(uint256 index)
        public
        view
        returns (string memory)
    {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
