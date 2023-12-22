const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const multihashes = require("multihashes")

const stringToBytes = function (string) {
    return ethers.utils.formatBytes32String(string)
}
const bytesToString = function (hexString) {
    return ethers.utils.parseBytes32String(hexString)
}
const cidToArgs = (cid) => {
    const mh = multihashes.fromB58String(Buffer.from(cid))
    return {
        hash_function: "0x" + Buffer.from(mh.slice(0, 1)).toString("hex"),
        size: "0x" + Buffer.from(mh.slice(1, 2)).toString("hex"),
        digest: "0x" + Buffer.from(mh.slice(2)).toString("hex"),
    }
}

const argsToCid = (hashFunction, size, digest) => {
    const hashHex = hashFunction.slice(2) + size.slice(2) + digest.slice(2)
    const hashBytes = Buffer.from(hashHex, "hex")
    return multihashes.toB58String(hashBytes)
}

const cid = "QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u"
const args = cidToArgs(cid)
const fake_cid = ["prova", args.hash_function, args.size, args.digest]

const FAKE_ADDRESS = "0x0000000000000000000000000000000000001234"
const FAKE_HASH = "QmVQw4eH5i91nvzzTmm3bf89nzsvw9vqVd3qD5J2Bo1qLH"

const fake_hash_array = [FAKE_HASH, FAKE_HASH, FAKE_HASH, FAKE_HASH, FAKE_HASH]
const fake_parent_array = [
    [FAKE_ADDRESS, stringToBytes("PROVAIDPADRE1")],
    [FAKE_ADDRESS, stringToBytes("PROVAIDPADRE1")],
]

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Third Single Log Contract Test", function () {
          let product, productContract, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = accounts[0]
              //await deployments.fixture(["productContract"]) // Deploys modules with the tags "productContract"

              const contract = await ethers.getContractFactory("StepContractSingleLog") // Returns a new connection to the Product contract

              productContract = await contract.deploy(
                  stringToBytes("CHAIN ID"),
                  stringToBytes("CHAIN STEP"),
                  stringToBytes("COMPANY NAME")
              )
              product = productContract.connect(deployer) // Returns a new instance of the Product contract connected to player
          })

          describe("Constructor", function () {
              it("Initializes the contract correctly", async () => {
                  const owner = await productContract.i_owner()
                  const company_name = (await productContract.i_company_name()).toString()
                  const chain_id = (await productContract.i_chain_id()).toString()
                  const chain_step = (await productContract.i_chain_step()).toString()

                  assert.equal(deployer.address, owner)
                  assert.equal(bytesToString(company_name), "COMPANY NAME")
                  assert.equal(bytesToString(chain_id), "CHAIN ID")
                  assert.equal(bytesToString(chain_step), "CHAIN STEP")
              })
          })

          describe("Others", function () {
              it("should return the initial IPFS CID", async () => {
                  const args = cidToArgs(cid)
                  const decodedCid = argsToCid(args.hash_function, args.size, args.digest)
                  assert.equal(cid, decodedCid, "The IPFS CID was not encoded/decoded correctly.")
              })

              it("correctly add and retrieve one hash in storage", async () => {
                const tx = await product.storeHash(
                    stringToBytes("CATEGORY"),
                    stringToBytes("PRODUCTID"),
                    fake_cid)
                const receipt = await tx.wait()
                //console.log(receipt.events[0].args.multi)

                assert.equal(stringToBytes("CATEGORY"), receipt.events[0].args.category)
                assert.equal(stringToBytes("PRODUCTID"), receipt.events[0].args.product_id)
                assert.equal(fake_cid[0], receipt.events[0].args.multi.file_name)
                assert.equal(fake_cid[1], receipt.events[0].args.multi.hash_function)
                assert.equal(fake_cid[2], receipt.events[0].args.multi.size)
                assert.equal(fake_cid[3], receipt.events[0].args.multi.hash)


              })

              it("emit event on adding batch", async () => {
                  await expect(
                      product.publishBatch(
                          stringToBytes("PROVACATEGORIA"),
                          stringToBytes("PROVAPRODOTTOID"),
                          fake_parent_array,
                          stringToBytes("PROVANOME"),
                          stringToBytes("UOM"),
                          10
                      )
                  ).to.emit(product, "emitBatch")
              })

              it("correctly retrieve batch values from logs", async () => {
                  parent_prod_id = stringToBytes("PARENTPRODID")
                  batch = {
                      category: stringToBytes("CATEGORY"),
                      product_id: stringToBytes("PRODUCTID"),
                      parent: [[FAKE_ADDRESS, parent_prod_id]],
                      product_name: stringToBytes("PROVANOME"),
                      uom: stringToBytes("UNITADIMISURA"),
                      quantity: 3,
                  }

                  const tx = await product.publishBatch(
                      batch.category,
                      batch.product_id,
                      batch.parent,
                      batch.product_name,
                      batch.uom,
                      batch.quantity
                  )
                  const receipt = await tx.wait()
                  //console.log(receipt.events[0].args)

                  assert.equal(stringToBytes("CATEGORY"), receipt.events[0].args.category)
                  assert.equal(stringToBytes("PRODUCTID"), receipt.events[0].args.product_id)
                  assert.equal(stringToBytes("PROVANOME"), receipt.events[0].args.product_name)
                  assert.equal(stringToBytes("UNITADIMISURA"), receipt.events[0].args.uom)

                  assert.equal(batch.parent[0][0], receipt.events[0].args.parent[0].parent_contract)
                  assert.equal(batch.parent[0][1], receipt.events[0].args.parent[0].product_id)

                  assert.equal(3, receipt.events[0].args.quantity)
              })

              it("Only allows the owner to add an hash", async function () {
                  const connectedContract = await product.connect(FAKE_ADDRESS)
                  expect(connectedContract.storeHash(fake_hash_array)).to.be.revertedWith(
                      "Product__NotOwner"
                  )
              })
              it("Only allows the owner to add a batch", async function () {
                  const connectedContract = await product.connect(FAKE_ADDRESS)
                  expect(
                      connectedContract.publishBatch("category", "product_id", fake_cid)
                  ).to.be.revertedWith("Product__NotOwner")
              })
          })
      })
