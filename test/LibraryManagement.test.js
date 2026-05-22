const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LibraryManagement", function () {
  async function deployFixture() {
    const [admin, user, secondUser] = await ethers.getSigners();
    const LibraryManagement = await ethers.getContractFactory("LibraryManagement");
    const library = await LibraryManagement.deploy();
    return { library, admin, user, secondUser };
  }

  it("registers deployer as admin", async function () {
    const { library, admin } = await deployFixture();

    const profile = await library.getUser(admin.address);

    expect(profile.wallet).to.equal(admin.address);
    expect(profile.role).to.equal(2);
    expect(profile.active).to.equal(true);
  });

  it("allows admin to add and update books", async function () {
    const { library } = await deployFixture();

    await library.addBook("Clean Code", "Robert C. Martin", "9780132350884", 3);
    let book = await library.getBook(1);
    expect(book.availableCopies).to.equal(3);

    await library.updateBook(1, "Clean Code", "Robert C. Martin", "9780132350884", 5, true);
    book = await library.getBook(1);
    expect(book.totalCopies).to.equal(5);
    expect(book.availableCopies).to.equal(5);
  });

  it("records borrow and return transactions", async function () {
    const { library, user } = await deployFixture();

    await library.addBook("Blockchain Basics", "Daniel Drescher", "9781484226032", 1);
    await library.connect(user).registerMyAccount("Nguyen Van A", "a@example.com");
    await library.connect(user).borrowBook(1);

    let book = await library.getBook(1);
    expect(book.availableCopies).to.equal(0);

    const records = await library.connect(user).getMyBorrowRecords();
    expect(records).to.have.lengthOf(1);
    expect(records[0].returned).to.equal(false);

    await library.connect(user).returnBook(records[0].id);
    book = await library.getBook(1);
    expect(book.availableCopies).to.equal(1);

    const updatedRecords = await library.connect(user).getMyBorrowRecords();
    expect(updatedRecords[0].returned).to.equal(true);
  });

  it("prevents users from admin actions", async function () {
    const { library, user } = await deployFixture();

    await library.connect(user).registerMyAccount("Tran Thi B", "b@example.com");

    await expect(
      library.connect(user).addBook("Solidity", "Author", "ISBN", 2)
    ).to.be.revertedWith("Admin permission required");
  });
});
