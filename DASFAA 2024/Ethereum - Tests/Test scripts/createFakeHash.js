const { ethers } = require("hardhat")
const multihashes = require("multihashes")

const STEP = ["Grape Grower", "Wine Producer", "Bulk Distributor", "Filler-Packer", "Distributor"]

const stringToBytes = function (string) {
    return ethers.utils.formatBytes32String(string)
}
const bytesToString = function (hexString) {
    return ethers.utils.toUtf8String(hexString)
}

const cidToArgs = (cid) => {
    const mh = multihashes.fromB58String(Buffer.from(cid))
    return {
        hash_function: "0x" + Buffer.from(mh.slice(0, 1)).toString("hex"),
        size: "0x" + Buffer.from(mh.slice(1, 2)).toString("hex"),
        digest: "0x" + Buffer.from(mh.slice(2)).toString("hex"),
    }
}

//GRAPE GROWER
const category_GG = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_GG = ["AA2022LOTTO1", "AA2022LOTTO2", "PINOTLOTTO1", "MALVASIAPARTITA1"]

//WINE PRODUCER
const category_WP = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_WP = ["AA2022BOTTE1", "AA2022BOTTE2", "PINOTBOTTE1", "MALVASIABOTTE1"]

//BULK DISTRIBUTOR
const category_BD = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_BD = ["TANK032", "TANK492", "TANK24532", "TANK111"]

//FILLER-PACKER
const category_FP = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_FP = ["PROD0223", "PROD0224", "PROD1221", "PROD0003"]

//DISTRIBUTOR
const category_D = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_D = ["PALLET0224", "PALLET2232", "PALLET1221", "PALLET0003"]

//CID to MULTIHASH
const cid1 = "QmVQw1eH5i91nvzzTmm3bf89nzsvw9vqVd3qD5J2Bo1qAA"
const cid2 = "QmVQw2eH5i91nvzzTmm3bf89nzsvw9vqVd3qD5J2Bo1qBB"
const cid3 = "QmVQw3eH5i91nvzzTmm3bf89nzsvw9vqVd3qD5J2Bo1qAB"
const cid4 = "QmVQw4eH5i91nvzzTmm3bf89nzsvw9vqVd3qD5J2Bo1qAC"

const args1 = cidToArgs(cid1)
const args2 = cidToArgs(cid2)
const args3 = cidToArgs(cid3)
const args4 = cidToArgs(cid4)

const GG_hash_cat = [
    ["Doc1GG_CAT", args1.hash_function, args1.size, args1.digest],
    ["Doc2GG_CAT", args2.hash_function, args2.size, args2.digest],
]
const WP_hash_cat = [
    ["Doc1WP_CAT", args1.hash_function, args1.size, args1.digest],
    ["Doc2WP_CAT", args2.hash_function, args2.size, args2.digest],
]
const BD_hash_cat = [
    ["Doc1BD_CAT", args1.hash_function, args1.size, args1.digest],
    ["Doc2BD_CAT", args2.hash_function, args2.size, args2.digest],
]
const FP_hash_cat = [
    ["Doc1FP_CAT", args1.hash_function, args1.size, args1.digest],
    ["Doc2FP_CAT", args2.hash_function, args2.size, args2.digest],
]
const D_hash_cat = [
    ["Doc1D_CAT", args1.hash_function, args1.size, args1.digest],
    ["Doc2D_CAT", args2.hash_function, args2.size, args2.digest],
]

const GG_hash_prod = [
    ["Doc1GG_PROD", args1.hash_function, args1.size, args1.digest],
    ["Doc2GG_PROD", args2.hash_function, args2.size, args2.digest],
]
const WP_hash_prod = [
    ["Doc1WP_PROD", args1.hash_function, args1.size, args1.digest],
    ["Doc2WP_PROD", args2.hash_function, args2.size, args2.digest],
]
const BD_hash_prod = [
    ["Doc1BD_PROD", args1.hash_function, args1.size, args1.digest],
    ["Doc2BD_PROD", args2.hash_function, args2.size, args2.digest],
]
const FP_hash_prod = [
    ["Doc1FP_PROD", args1.hash_function, args1.size, args1.digest],
    ["Doc2FP_PROD", args2.hash_function, args2.size, args2.digest],
]
const D_hash_prod = [
    ["Doc1D_PROD", args1.hash_function, args1.size, args1.digest],
    ["Doc2D_PROD", args2.hash_function, args2.size, args2.digest],
]

const category = [category_GG, category_WP, category_BD, category_FP, category_D]
const productID = [productID_GG, productID_WP, productID_BD, productID_FP, productID_D]
const hashes_cat = [GG_hash_cat, WP_hash_cat, BD_hash_cat, FP_hash_cat, D_hash_cat]
const hashes_prod = [GG_hash_prod, WP_hash_prod, BD_hash_prod, FP_hash_prod, D_hash_prod]

const multi_docs = [
    ["Doc1GENERIC", args3.hash_function, args3.size, args3.digest],
    ["DocDoc2GENERIC2", args4.hash_function, args4.size, args4.digest],
]
async function publishFakeHash() {
    for (let index = 0; index < STEP.length; index++) {
        const contract = await ethers.getContract(STEP[index])

        //GENERAL DOCS FOR COMPANY
        var tx = await contract.storeHash(
            stringToBytes("GENERIC"),
            stringToBytes("GENERIC"),
            multi_docs
        )
        var receipt = await tx.wait()

        console.log(
            STEP[index] + " general Docs company",
            "block Number: " + receipt.blockNumber,
            "tx Hash: " + receipt.transactionHash,
            "Gas Used: " + receipt.gasUsed
        )
        //GENERAL DOCS FOR CATEOGORY
        for (let i = 0; i < 4; i++) {
            var tx = await contract.storeHash(
                stringToBytes(category[index][i]),
                stringToBytes("GENERIC"),
                hashes_cat[index]
            )
            var receipt = await tx.wait()

            console.log(
                STEP[index] + " general Docs category",
                "Category:" + category[index][i],
                "block Number: " + receipt.blockNumber,
                "tx Hash: " + receipt.transactionHash,
                "Gas Used: " + receipt.gasUsed
            )
        }

        for (let i = 0; i < 4; i++) {
            var tx = await contract.storeHash(
                stringToBytes(category[index][i]),
                stringToBytes(productID[index][i]),
                hashes_prod[index]
            )

            var receipt = await tx.wait()

            console.log(
                STEP[index] + "Docs for Product",
                "Category :" + category[index][i],
                "Product ID: " + productID[index][i],
                "block Number: " + receipt.blockNumber,
                "tx Hash: " + receipt.transactionHash,
                "Gas Used: " + receipt.gasUsed
            )
        }
    }
}

publishFakeHash()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
