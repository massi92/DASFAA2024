const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { FacetCutAction } = require("hardhat-deploy/dist/types")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const multihashes = require("multihashes")

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
const fake_cid_array = [
    ["prova", args.hash_function, args.size, args.digest],
    ["prova", args.hash_function, args.size, args.digest],
    ["prova", args.hash_function, args.size, args.digest],
    ["prova", args.hash_function, args.size, args.digest],
    ["prova", args.hash_function, args.size, args.digest],
]

const FAKE_ADDRESS = "0x0000000000000000000000000000000000001234"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Second String CID Contract Test", function () {
          let product, productContract, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = accounts[0]
              //await deployments.fixture(["productContract"]) // Deploys modules with the tags "productContract"

              const contract = await ethers.getContractFactory("StepContractStringsCID") // Returns a new connection to the Product contract

              productContract = await contract.deploy("CHAIN ID", "CHAIN STEP", "COMPANY NAME")
              product = productContract.connect(deployer) // Returns a new instance of the Product contract connected to player
          })

          describe("Constructor", function () {
              it("Initializes the contract correctly", async () => {
                  const owner = await productContract.i_owner()
                  const company_name = (await productContract.i_company_name()).toString()
                  const chain_id = (await productContract.i_chain_id()).toString()
                  const chain_step = (await productContract.i_chain_step()).toString()

                  assert.equal(deployer.address, owner)
                  assert.equal(company_name, "COMPANY NAME")
                  assert.equal(chain_id, "CHAIN ID")
                  assert.equal(chain_step, "CHAIN STEP")
              })
          })

          describe("Others", function () {
              it("should return the initial IPFS CID", async () => {
                  const args = cidToArgs(cid)
                  const decodedCid = argsToCid(args.hash_function, args.size, args.digest)
                  assert.equal(cid, decodedCid, "The IPFS CID was not encoded/decoded correctly.")
              })

              it("correctly add and retrieve one hash in storage", async () => {
                  await product.addHashCID(fake_cid_array[0])

                  const hash_array = await product.multihashes([0])

                  assert.equal(fake_cid_array[0][0], hash_array.file_name)
                  assert.equal(fake_cid_array[0][1], hash_array.hash_function)
                  assert.equal(fake_cid_array[0][2], hash_array.size)
                  assert.equal(fake_cid_array[0][3], hash_array.hash)
              })

              it("correctly add and retrieve multiple (5) hash in storage", async () => {
                  await product.addMultipleHashCID(fake_cid_array)

                  const hash_array = await product.getAllHashes()

                  for (let index = 0; index < hash_array.length; index++) {
                      assert.equal(fake_cid_array[index][0], hash_array[index].file_name)
                      assert.equal(fake_cid_array[index][1], hash_array[index].hash_function)
                      assert.equal(fake_cid_array[index][2], hash_array[index].size)
                      assert.equal(fake_cid_array[index][3], hash_array[index].hash)
                  }
              })

              it("correctly add and retrieve batch in storage", async () => {
                  parent_prod_id = "PARENTPRODID"
                  batch = {
                      category: "CATEGORY",
                      product_id: "PRODUCTID",
                      parent: [[FAKE_ADDRESS, parent_prod_id]],
                      product_name: "PROVANOME",
                      uom: "UNITADIMISURA",
                      quantity: 3,
                  }

                  await product.addBatch(batch)

                  const batch_result = await product.s_batches(0)
                  //console.log(batch_result)
                  assert.equal(batch.category, batch_result.category)
                  assert.equal(batch.product_id, batch_result.product_id)
                  assert.equal(batch.product_name, batch_result.product_name)
                  assert.equal(batch.uom, batch_result.uom)
                  assert.equal(batch.quantity, batch_result.quantity)
              })

              it("Only allows the owner to add an hash", async function () {
                  const connectedContract = await product.connect(FAKE_ADDRESS)
                  expect(connectedContract.addHashCID(fake_cid_array[0])).to.be.revertedWith(
                      "Product__NotOwner"
                  )
              })
              it("Only allows the owner to add an hash", async function () {
                  const connectedContract = await product.connect(FAKE_ADDRESS)
                  expect(connectedContract.addMultipleHashCID(fake_cid_array)).to.be.revertedWith(
                      "Product__NotOwner"
                  )
              })
              it("Only allows the owner to add a batch", async function () {
                  const connectedContract = await product.connect(FAKE_ADDRESS)
                  expect(
                      connectedContract.addBatch("category", "product_id", fake_cid_array)
                  ).to.be.revertedWith("Product__NotOwner")
              })
          })
      })
