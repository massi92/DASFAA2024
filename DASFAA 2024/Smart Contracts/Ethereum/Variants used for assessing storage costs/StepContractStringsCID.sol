//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

error Product__NotOwner();
error ProductContract__ContractClosed();

/**
 * @title Contract
 * @dev store IPFS hash of a file
 */
contract StepContractStringsCID {
    address public immutable i_owner;
    string public i_company_name;
    string public i_chain_id;
    string public i_chain_step;

    Multihash[] public multihashes;
    Batch[] public s_batches;

    struct ParentInfo {
        address parent_contract;
        string product_id;
    }

    struct Batch {
        string category;
        string product_id;
        ParentInfo[] parent;
        string product_name;
        string uom;
        uint256 quantity;
    }

    struct Multihash {
        string file_name;
        bytes1 hash_function;
        bytes1 size;
        bytes32 hash;
    }

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Product__NotOwner();
        _;
    }

    constructor(string memory chain_id, string memory chain_step, string memory company_name) {
        i_owner = msg.sender;
        i_chain_id = chain_id;
        i_chain_step = chain_step;
        i_company_name = company_name;
    }

    function addHashCID(Multihash memory multi) public onlyOwner {
        multihashes.push(multi);
    }

    function addMultipleHashCID(Multihash[] memory multi) public onlyOwner {
        uint arrayLength = multi.length;
        for (uint i = 0; i < arrayLength; i++) {
            multihashes.push(multi[i]);
        }
    }
     
    function getAllHashes() public view returns (Multihash[] memory) {
        return multihashes;
    }

    function addBatch(Batch calldata batch) public onlyOwner {
        s_batches.push(batch);
    }
}
