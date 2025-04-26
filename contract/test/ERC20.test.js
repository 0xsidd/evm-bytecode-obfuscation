const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { initCode, obfuscatedRuntimeBytecode, originalRuntimeBytecode } = require("../constants/Bytecodes");

describe("MyToken", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployMyTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");

    const isObfuscated = true;

    // Combine initcode and runtime bytecode for the potential obfuscated version
    const obfuscatedBytecode = initCode + obfuscatedRuntimeBytecode;

    const normalBytecode = initCode + originalRuntimeBytecode;

    // Select the bytecode to deploy
    const bytecodeToDeploy = isObfuscated ? obfuscatedBytecode : normalBytecode;

    // Calculate the deployment address deterministically
    const nonce = await owner.getNonce();
    const deployedAddress = ethers.getCreateAddress({
      from: owner.address,
      nonce,
    });

    // Send the deployment transaction
    const tx = await owner.sendTransaction({ data: bytecodeToDeploy, nonce });
    await tx.wait(); // Wait for the transaction to be mined

    // Attach the contract factory to the deployed address
    const myToken = MyToken.attach(deployedAddress);

    return { myToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { myToken, owner } = await loadFixture(deployMyTokenFixture);
      expect(await myToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner (initially 0)", async function () {
      const { myToken, owner } = await loadFixture(deployMyTokenFixture);
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
      expect(ownerBalance).to.equal(0); // Initially no tokens are minted
    });

    it("Should have the correct name and symbol", async function () {
      const { myToken } = await loadFixture(deployMyTokenFixture);
      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MTK");
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint tokens", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const mintAmount = ethers.parseUnits("1000", 18); // Mint 1000 tokens

      // Mint to owner
      await expect(myToken.mint(owner.address, mintAmount))
        .to.emit(myToken, "Transfer")
        .withArgs(ethers.ZeroAddress, owner.address, mintAmount);
      expect(await myToken.balanceOf(owner.address)).to.equal(mintAmount);
      expect(await myToken.totalSupply()).to.equal(mintAmount);

      // Mint to other account
      const mintAmount2 = ethers.parseUnits("500", 18);
      await expect(myToken.mint(otherAccount.address, mintAmount2))
        .to.emit(myToken, "Transfer")
        .withArgs(ethers.ZeroAddress, otherAccount.address, mintAmount2);
      expect(await myToken.balanceOf(otherAccount.address)).to.equal(
        mintAmount2
      );
      expect(await myToken.totalSupply()).to.equal(mintAmount + mintAmount2);
    });

    it("Should prevent non-owners from minting tokens", async function () {
      const { myToken, otherAccount } = await loadFixture(deployMyTokenFixture);
      const mintAmount = ethers.parseUnits("100", 18);

      // Attempt to mint from otherAccount
      // Need to figure out the exact error message from Ownable
      // await expect(myToken.connect(otherAccount).mint(otherAccount.address, mintAmount))
      //   .to.be.revertedWith("Ownable: caller is not the owner"); // Or the specific error Ownable throws
      await expect(
        myToken.connect(otherAccount).mint(otherAccount.address, mintAmount)
      )
        .to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const mintAmount = ethers.parseUnits("1000", 18);
      await myToken.mint(owner.address, mintAmount); // Mint initial tokens to owner

      const transferAmount = ethers.parseUnits("100", 18);

      // Transfer from owner to otherAccount
      await expect(myToken.transfer(otherAccount.address, transferAmount))
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, otherAccount.address, transferAmount);

      const ownerBalance = await myToken.balanceOf(owner.address);
      const otherAccountBalance = await myToken.balanceOf(otherAccount.address);

      expect(ownerBalance).to.equal(mintAmount - transferAmount);
      expect(otherAccountBalance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const mintAmount = ethers.parseUnits("100", 18);
      await myToken.mint(owner.address, mintAmount);

      const transferAmount = ethers.parseUnits("1000", 18); // More than owner has

      // Try to transfer more than balance
      await expect(myToken.transfer(otherAccount.address, transferAmount))
        .to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance")
        .withArgs(owner.address, mintAmount, transferAmount);
    });

    it("Should update balances after multiple transfers", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const mintAmount = ethers.parseUnits("1000", 18);
      await myToken.mint(owner.address, mintAmount);

      const transfer1Amount = ethers.parseUnits("100", 18);
      const transfer2Amount = ethers.parseUnits("50", 18);

      // First transfer
      await myToken.transfer(otherAccount.address, transfer1Amount);
      // Second transfer
      await myToken.transfer(otherAccount.address, transfer2Amount);

      const ownerBalance = await myToken.balanceOf(owner.address);
      const otherAccountBalance = await myToken.balanceOf(otherAccount.address);

      expect(ownerBalance).to.equal(
        mintAmount - transfer1Amount - transfer2Amount
      );
      expect(otherAccountBalance).to.equal(transfer1Amount + transfer2Amount);
    });
  });

  describe("Approval and TransferFrom", function () {
    it("Should allow an approved spender to transfer tokens", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const [, , thirdAccount] = await ethers.getSigners(); // Get a third account
      const mintAmount = ethers.parseUnits("1000", 18);
      await myToken.mint(owner.address, mintAmount);

      const approveAmount = ethers.parseUnits("200", 18);
      const transferAmount = ethers.parseUnits("150", 18);

      // Owner approves otherAccount to spend tokens
      await expect(myToken.approve(otherAccount.address, approveAmount))
        .to.emit(myToken, "Approval")
        .withArgs(owner.address, otherAccount.address, approveAmount);
      expect(
        await myToken.allowance(owner.address, otherAccount.address)
      ).to.equal(approveAmount);

      // otherAccount transfers tokens from owner to thirdAccount
      await expect(
        myToken
          .connect(otherAccount)
          .transferFrom(owner.address, thirdAccount.address, transferAmount)
      )
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, thirdAccount.address, transferAmount);

      // Check balances
      const ownerBalance = await myToken.balanceOf(owner.address);
      const thirdAccountBalance = await myToken.balanceOf(thirdAccount.address);
      expect(ownerBalance).to.equal(mintAmount - transferAmount);
      expect(thirdAccountBalance).to.equal(transferAmount);

      // Check remaining allowance
      expect(
        await myToken.allowance(owner.address, otherAccount.address)
      ).to.equal(approveAmount - transferAmount);
    });

    it("Should fail if spender tries to transfer more than allowed", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const mintAmount = ethers.parseUnits("1000", 18);
      await myToken.mint(owner.address, mintAmount);

      const approveAmount = ethers.parseUnits("100", 18);
      const transferAmount = ethers.parseUnits("150", 18); // More than approved

      await myToken.approve(otherAccount.address, approveAmount);

      // Try to transfer more than allowed
      await expect(
        myToken
          .connect(otherAccount)
          .transferFrom(owner.address, otherAccount.address, transferAmount)
      )
        .to.be.revertedWithCustomError(myToken, "ERC20InsufficientAllowance")
        .withArgs(otherAccount.address, approveAmount, transferAmount);
    });

    it("Should fail if spender tries to transfer more than owner's balance", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const mintAmount = ethers.parseUnits("100", 18);
      await myToken.mint(owner.address, mintAmount);

      const approveAmount = ethers.parseUnits("200", 18); // Approve more than owner has
      const transferAmount = ethers.parseUnits("150", 18); // Try to transfer more than owner has

      await myToken.approve(otherAccount.address, approveAmount);

      // Try to transfer more than owner's balance
      await expect(
        myToken
          .connect(otherAccount)
          .transferFrom(owner.address, otherAccount.address, transferAmount)
      )
        .to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance")
        .withArgs(owner.address, mintAmount, transferAmount);
    });

    it("Should handle zero approvals and transfers correctly", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const mintAmount = ethers.parseUnits("100", 18);
      await myToken.mint(owner.address, mintAmount);

      // Approve zero
      await expect(myToken.approve(otherAccount.address, 0))
        .to.emit(myToken, "Approval")
        .withArgs(owner.address, otherAccount.address, 0);
      expect(
        await myToken.allowance(owner.address, otherAccount.address)
      ).to.equal(0);

      // Try to transferFrom with zero allowance
      await expect(
        myToken
          .connect(otherAccount)
          .transferFrom(owner.address, otherAccount.address, 1)
      )
        .to.be.revertedWithCustomError(myToken, "ERC20InsufficientAllowance")
        .withArgs(otherAccount.address, 0, 1);

      // Approve some amount
      const approveAmount = ethers.parseUnits("50", 18);
      await myToken.approve(otherAccount.address, approveAmount);

      // Transfer zero
      await expect(
        myToken
          .connect(otherAccount)
          .transferFrom(owner.address, otherAccount.address, 0)
      )
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, otherAccount.address, 0);

      expect(await myToken.balanceOf(owner.address)).to.equal(mintAmount);
      expect(
        await myToken.allowance(owner.address, otherAccount.address)
      ).to.equal(approveAmount);
    });
  });

  describe("View Functions", function () {
    it("Should return the correct decimals", async function () {
      const { myToken } = await loadFixture(deployMyTokenFixture);
      // const decimalsSignature = {
      //   'decimals': await myToken.interface.getFunction("decimals").selector,
      //   'totalSupply': await myToken.interface.getFunction("totalSupply").selector,
      //   'balanceOf': await myToken.interface.getFunction("balanceOf").selector,
      //   'transfer': await myToken.interface.getFunction("transfer").selector,
      //   'allowance': await myToken.interface.getFunction("allowance").selector,
      //   'approve': await myToken.interface.getFunction("approve").selector,
      //   'transferFrom': await myToken.interface.getFunction("transferFrom").selector,
      //   'name': await myToken.interface.getFunction("name").selector,
      //   'symbol': await myToken.interface.getFunction("symbol").selector,
      //   'mint': await myToken.interface.getFunction("mint").selector,
      //   'owner': await myToken.interface.getFunction("owner").selector
      // };
      // console.log('decimalsSignature',decimalsSignature);
      expect(await myToken.decimals()).to.equal(18);
    });

    it("Should return the correct totalSupply", async function () {
      const { myToken, owner } = await loadFixture(deployMyTokenFixture);
      expect(await myToken.totalSupply()).to.equal(0); // Initially zero

      const mintAmount = ethers.parseUnits("1000", 18);
      await myToken.mint(owner.address, mintAmount);
      expect(await myToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should return the correct balance for an account", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      const balanceOfCalldata = myToken.interface.encodeFunctionData("balanceOf", [owner.address]);
      expect(await myToken.balanceOf(owner.address)).to.equal(0);
      expect(await myToken.balanceOf(otherAccount.address)).to.equal(0);

      const mintAmountOwner = ethers.parseUnits("1000", 18);
      await myToken.mint(owner.address, mintAmountOwner);
      expect(await myToken.balanceOf(owner.address)).to.equal(mintAmountOwner);

      const mintAmountOther = ethers.parseUnits("500", 18);
      await myToken.mint(otherAccount.address, mintAmountOther);
      expect(await myToken.balanceOf(otherAccount.address)).to.equal(
        mintAmountOther
      );
    });

    it("Should return the correct allowance", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployMyTokenFixture
      );
      expect(
        await myToken.allowance(owner.address, otherAccount.address)
      ).to.equal(0); // Initially zero

      const approveAmount = ethers.parseUnits("200", 18);
      await myToken.approve(otherAccount.address, approveAmount);
      expect(
        await myToken.allowance(owner.address, otherAccount.address)
      ).to.equal(approveAmount);

      // Check allowance doesn't affect other pairs
      const [, , thirdAccount] = await ethers.getSigners();
      expect(
        await myToken.allowance(owner.address, thirdAccount.address)
      ).to.equal(0);
      expect(
        await myToken.allowance(otherAccount.address, owner.address)
      ).to.equal(0);
    });
  });

  // Add tests for Minting and other ERC20 functions here
});
