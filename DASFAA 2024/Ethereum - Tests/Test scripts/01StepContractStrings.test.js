const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const FAKE_ADDRESS = "0x0000000000000000000000000000000000001234"
const FAKE_HASH = "QmVQw4eH5i91nvzzTmm3bf89nzsvw9vqVd3qD5J2Bo1qLH"

const fake_hash_array = [FAKE_HASH, FAKE_HASH, FAKE_HASH, FAKE_HASH, FAKE_HASH]

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("First String Contract Test", function () {
          let product, productContract, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = accounts[0]
              //await deployments.fixture(["productContract"]) // Deploys modules with the tags "productContract"

              const contract = await ethers.getContractFactory("StepContractStrings") // Returns a new connection to the Product contract

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
              it("correctly add and retrieve one hash in storage", async () => {
                  await product.addHash(fake_hash_array[0])

                  const hash_array = await product.s_ipfsHashes([0])
                  assert.equal(fake_hash_array[0], hash_array)
              })

              it("correctly add and retrieve multiple (5) hash in storage", async () => {
                  await product.addHashes(fake_hash_array)

                  const hash_array = await product.getAllHashes()
                  assert.equal(fake_hash_array[0], hash_array[0])
                  assert.equal(fake_hash_array[1], hash_array[1])
                  assert.equal(fake_hash_array[2], hash_array[2])
                  assert.equal(fake_hash_array[3], hash_array[3])
                  assert.equal(fake_hash_array[4], hash_array[4])
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
                  expect(connectedContract.addHash(FAKE_HASH)).to.be.revertedWith(
                      "Product__NotOwner"
                  )
              })
              it("Only allows the owner to add a batch", async function () {
                  const connectedContract = await product.connect(FAKE_ADDRESS)
                  expect(
                      connectedContract.addBatch("category", "product_id", fake_hash_array)
                  ).to.be.revertedWith("Product__NotOwner")
              })
          })
      })
