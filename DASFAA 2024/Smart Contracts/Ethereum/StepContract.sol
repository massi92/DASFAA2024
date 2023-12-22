//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

error Product__NotOwner();

/**
 * @title Contract
 * @dev store IPFS hash of a file
 */
contract StepContract {
    address public immutable i_owner;
    bytes32 public i_company_name;
    bytes32 public i_chain_id;
    bytes32 public i_chain_step;

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Product__NotOwner();
        _;
    }

    constructor(bytes32 chain_id, bytes32 chain_step, bytes32 company_name) {
        i_owner = msg.sender;
        i_chain_id = chain_id;
        i_chain_step = chain_step;
        i_company_name = company_name;
    }

    struct Multihash {
        string file_name;
        bytes1 hash_function;
        bytes1 size;
        bytes32 hash;
    }

    struct ParentInfo {
        address parent_contract;
        bytes32 product_id;
    }

    event emitBatch(
        bytes32 indexed category,
        bytes32 indexed product_id,
        ParentInfo[] parent,
        bytes32 product_name,
        bytes32 uom,
        uint256 quantity
    );

    function publishBatch(
        bytes32 category,
        bytes32 product_id,
        ParentInfo[] calldata parent,
        bytes32 product_name,
        bytes32 uom,
        uint256 quantity
    ) public onlyOwner {
        emit emitBatch(category, product_id, parent, product_name, uom, quantity);
    }

    event emitHashes(bytes32 indexed category, bytes32 indexed product_id, Multihash[] multi);

    function storeHash(
        bytes32 category,
        bytes32 product_id,
        Multihash[] calldata multi
    ) public onlyOwner {
        emit emitHashes(category, product_id, multi);
    }
}
