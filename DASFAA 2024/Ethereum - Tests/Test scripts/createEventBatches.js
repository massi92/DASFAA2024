const { ethers } = require("hardhat")
const {
    frontEndContractsFile,
} = require("../helper-hardhat-config")

const fs = require("fs")

const STEP = ["Grape Grower", "Wine Producer", "Bulk Distributor", "Filler-Packer", "Distributor"]

let contractGG,contractWP,contractBD,contractFP,contractD

const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
if (network.config.chainId.toString() in contractAddresses) {
    for (let index = 0; index < contractAddresses[network.config.chainId.toString()].length; index++) {
        const element = contractAddresses[network.config.chainId.toString()][index];

        switch (index) {
            case 0:
                contractGG = element
                break;
            case 1:
                contractWP = element
                break;
            case 2:
                contractBD = element
                break;
            case 3:
                contractFP = element
                break;
            case 4:
                contractD = element
                break;
            default:
                break;
        }
        
    }    
}

const stringToBytes = function (string) {
    return ethers.utils.formatBytes32String(string)
}
const bytesToString = function (hexString) {
    return ethers.utils.toUtf8String(hexString)
}

//GRAPE GROWER
const category_GG = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_GG = ["AA2022LOTTO1", "AA2022LOTTO2", "PINOTLOTTO1", "MALVASIAPARTITA1"]
const arrayParentIDs_GG = [[], [], [], []]
const productName_GG = [
    "Uva qualità Vermentino",
    "Uva qualità Vermentino",
    "Uva qualità Pinot",
    "Uva qualità Malvasia",
]
const uom_GG = "Quintali"
const quantity_GG = [3, 4, 5, 6]

//WINE PRODUCER
const category_WP = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_WP = ["AA2022BOTTE1", "AA2022BOTTE2", "PINOTBOTTE1", "MALVASIABOTTE1"]
const arrayParentIDs_WP = [
    [
        [contractGG, stringToBytes("AA2022LOTTO1")],
        [contractGG, stringToBytes("AA2022LOTTO2")],
    ],
    [[contractGG, stringToBytes("AA2022LOTTO2")]],
    [[contractGG, stringToBytes("PINOTLOTTO1")]],
    [[contractGG, stringToBytes("MALVASIAPARTITA1")]],
]
const productName_WP = [
    "Vermentino Nero DOC",
    "Vermentino Nero DOC",
    "Pinot Bianco",
    "Malvasia DOC",
]
const uom_WP = "Litri"
const quantity_WP = [300, 400, 500, 600]

//BULK DISTRIBUTOR
const category_BD = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_BD = ["TANK032", "TANK492", "TANK24532", "TANK111"]
const arrayParentIDs_BD = [
    [
        [contractWP, stringToBytes("AA2022BOTTE1")],
        [contractWP, stringToBytes("AA2022BOTTE2")],
    ],
    [[contractWP, stringToBytes("AA2022BOTTE2")]],
    [[contractWP, stringToBytes("PINOTBOTTE1")]],
    [[contractWP, stringToBytes("MALVASIABOTTE1")]],
]
const productName_BD = ["Tank Vermentino", "Tank Vermentino", "Tank Pinot", "Tank Malvasia"]
const uom_BD = "Ettolitri"
const quantity_BD = [300, 400, 500, 600]

//FILLER-PACKER
const category_FP = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_FP = ["PROD0223", "PROD0224", "PROD1221", "PROD0003"]
const arrayParentIDs_FP = [
    [
        [contractBD, stringToBytes("TANK032")],
        [contractBD, stringToBytes("TANK492")],
    ],
    [[contractBD, stringToBytes("TANK492")]],
    [[contractBD, stringToBytes("TANK24532")]],
    [[contractBD, stringToBytes("TANK111")]],
]
const productName_FP = [
    "Vermentino Nero DOC",
    "Vermentino Nero DOC",
    "Pinot Bianco",
    "Malvasia DOC",
]
const uom_FP = "Bottiglie"
const quantity_FP = [30000, 40000, 50000, 60000]

//DISTRIBUTOR
const category_D = ["Vermentino", "Vermentino", "Pinot", "Malvasia"]
const productID_D = ["PALLET0224", "PALLET2232", "PALLET1221", "PALLET0003"]
const arrayParentIDs_D = [
    [
        [contractFP, stringToBytes("PROD0223")],
        [contractFP, stringToBytes("PROD0224")],
    ],
    [[contractFP, stringToBytes("PROD0224")]],
    [[contractFP, stringToBytes("PROD1221")]],
    [[contractFP, stringToBytes("PROD0003")]],
]
const productName_D = ["Vermentino Nero DOC", "Vermentino Nero DOC", "Pinot Bianco", "Malvasia DOC"]
const uom_D = "Cartoni 6 Pz"
const quantity_D = [35, 42, 64, 90]

const category = [category_GG, category_WP, category_BD, category_FP, category_D]
const productID = [productID_GG, productID_WP, productID_BD, productID_FP, productID_D]
const productName = [productName_GG, productName_WP, productName_BD, productName_FP, productName_D]
const uom = [uom_GG, uom_WP, uom_BD, uom_FP, uom_D]
const quantity = [quantity_GG, quantity_WP, quantity_BD, quantity_FP, quantity_D]
const arrayParentIDs = [
    arrayParentIDs_GG,
    arrayParentIDs_WP,
    arrayParentIDs_BD,
    arrayParentIDs_FP,
    arrayParentIDs_D,
]
const addresses = []
async function publishBatches() {
    
    for (let index = 0; index < STEP.length; index++) {
        const contract = await ethers.getContract(STEP[index])
        //GENERAL DOCS GG
        for (let i = 0; i < 4; i++) {
            var tx = await contract.publishBatch(
                stringToBytes(category[index][i]),
                stringToBytes(productID[index][i]),
                arrayParentIDs[index][i],
                stringToBytes(productName[index][i]),
                stringToBytes(uom[index]),
                quantity[index][i]
            )

            var receipt = await tx.wait()

            console.log(
                STEP[index] + " Batch no" + i,
                "Category:" + category[index][i],
                "block Number: " + receipt.blockNumber,
                "tx Hash: " + receipt.transactionHash,
                "Gas Used: " + receipt.gasUsed
            )
        }
    }
}

publishBatches()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
