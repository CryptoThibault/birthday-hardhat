const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Birthday', async function () {
  let BIRTHDAY, birthday, owner, alice, bob;
  const TIME = 3600 * 24 * 7;
  const GIVE_VALUE = ethers.utils.parseEther('0.000001');
  beforeEach(async function () {
    ;[owner, alice, bob] = await ethers.getSigners();
    BIRTHDAY = await ethers.getContractFactory('Birthday');
    birthday = await BIRTHDAY.connect(owner).deploy(alice.address, TIME);
    await birthday.deployed();
  });
  describe('Deployment', async function () {
    it('Should be the good star', async function () {
      expect(await birthday.star()).to.equal(alice.address);
    });
    it('Should set birthday higher than time', async function () {
      expect(await birthday.day()).to.above(TIME);
    });
  });
  describe('Give', async function () {
    let GIVE;
    beforeEach(async function () {
      GIVE = await birthday.connect(bob).give({ value: GIVE_VALUE });
    });
    it('Should change balances of user and contract', async function () {
      expect(GIVE).to.changeEtherBalances([bob, birthday], [-GIVE_VALUE, GIVE_VALUE]);
      expect(await birthday.balance()).to.equal(GIVE_VALUE);
    });
    it('Should emit events Gave', async function () {
      expect(GIVE).to.emit(birthday, 'Gave').withArgs(bob.address, GIVE_VALUE);
    });
    it('Should revert call if sender is birthday star', async function () {
      await expect(birthday.connect(alice).give({ value: GIVE_VALUE }))
        .to.revertedWith('Birthday: cannot give to yourself');
    });
    it('Should revert call if birthday already pass', async function () {
      await ethers.provider.send('evm_increaseTime', [TIME]);
      await ethers.provider.send('evm_mine');
      await expect(birthday.connect(bob).give({ value: GIVE_VALUE }))
        .to.revertedWith('Birthday: cannot give if birthday already pass');
    });
  });
  describe('Claim', async function () {
    let CLAIM;
    beforeEach(async function () {
      await birthday.connect(bob).give({ value: GIVE_VALUE });
      await ethers.provider.send('evm_increaseTime', [TIME]);
      await ethers.provider.send('evm_mine');
      CLAIM = await birthday.connect(alice).claim();
    });
    it('Should change balances of contract and star', async function () {
      expect(CLAIM).to.changeEtherBalances([birthday, alice], [-GIVE_VALUE, GIVE_VALUE]);
      expect(await birthday.balance()).to.equal(0);
    });
    it('Should emit events Claimed', async function () {
      expect(CLAIM).to.emit(birthday, 'Claimed').withArgs(alice.address, GIVE_VALUE);
    });
    it('Should revert call if sender is not birthday star', async function () {
      await expect(birthday.connect(bob).claim())
        .to.revertedWith('Birthday: cannot withdraw star gift');
    });
    it('Should revert call if birthday already pass', async function () {
      await ethers.provider.send('evm_increaseTime', [-TIME]);
      await ethers.provider.send('evm_mine');
      await expect(birthday.connect(alice).claim())
        .to.revertedWith('Birthday: cannot get gift before birthday');
    });
  });
});
