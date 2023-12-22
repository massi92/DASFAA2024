//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

error Product__NotOwner();
error ProductContract__ContractClosed();

/**
 * @title Contract
 * @dev store IPFS hash of a file
 */
contract StepContractStrings {
    address public immutable i_owner;
    string public i_company_name;
    string public i_chain_id;
    string public i_chain_step;

    string[] public s_ipfsHashes;

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
    Batch[] public s_batches;

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

    function addHash(string memory hash) public onlyOwner {
        s_ipfsHashes.push(hash);
    }

    function addHashes(string[] memory hashes) public onlyOwner {
        uint arrayLength = hashes.length;
        for (uint i = 0; i < arrayLength; i++) {
            s_ipfsHashes.push(hashes[i]);
        }
    }
    
    function getAllHashes() public view returns (string[] memory) {
        return s_ipfsHashes;
    }

    function addBatch(Batch calldata batch) public onlyOwner {
        s_batches.push(batch);
    }
}
