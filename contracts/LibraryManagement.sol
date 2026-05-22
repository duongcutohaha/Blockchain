// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LibraryManagement is Ownable {
    enum Role {
        None,
        User,
        Admin
    }

    struct Book {
        uint256 id;
        string title;
        string author;
        string isbn;
        uint256 totalCopies;
        uint256 availableCopies;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct LibraryUser {
        address wallet;
        string fullName;
        string email;
        Role role;
        bool active;
        uint256 createdAt;
    }

    struct BorrowRecord {
        uint256 id;
        uint256 bookId;
        address user;
        uint256 borrowedAt;
        uint256 returnedAt;
        bool returned;
    }

    uint256 private nextBookId = 1;
    uint256 private nextRecordId = 1;

    mapping(uint256 => Book) private books;
    mapping(address => LibraryUser) private users;
    mapping(uint256 => BorrowRecord) private borrowRecords;
    mapping(address => uint256[]) private userRecordIds;
    mapping(uint256 => uint256[]) private bookRecordIds;

    uint256[] private bookIds;
    address[] private userAddresses;
    mapping(address => bool) private knownUser;

    event BookAdded(uint256 indexed bookId, string title, uint256 totalCopies);
    event BookUpdated(uint256 indexed bookId, string title, uint256 totalCopies, bool active);
    event UserRegistered(address indexed wallet, string fullName, Role role);
    event UserUpdated(address indexed wallet, string fullName, Role role, bool active);
    event BookBorrowed(uint256 indexed recordId, uint256 indexed bookId, address indexed user);
    event BookReturned(uint256 indexed recordId, uint256 indexed bookId, address indexed user);

    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin && users[msg.sender].active, "Admin permission required");
        _;
    }

    modifier onlyActiveUser() {
        require(users[msg.sender].active, "Active user required");
        require(users[msg.sender].role == Role.User || users[msg.sender].role == Role.Admin, "Unknown role");
        _;
    }

    constructor() Ownable(msg.sender) {
        _upsertUser(msg.sender, "System Admin", "admin@library.local", Role.Admin, true);
    }

    function registerMyAccount(string calldata fullName, string calldata email) external {
        require(bytes(fullName).length > 0, "Full name is required");
        require(!knownUser[msg.sender] || users[msg.sender].role == Role.None, "Account already exists");
        _upsertUser(msg.sender, fullName, email, Role.User, true);
    }

    function addOrUpdateUser(
        address wallet,
        string calldata fullName,
        string calldata email,
        Role role,
        bool active
    ) external onlyAdmin {
        require(wallet != address(0), "Invalid wallet");
        require(role == Role.User || role == Role.Admin, "Invalid role");
        require(bytes(fullName).length > 0, "Full name is required");
        _upsertUser(wallet, fullName, email, role, active);
    }

    function addBook(
        string calldata title,
        string calldata author,
        string calldata isbn,
        uint256 totalCopies
    ) external onlyAdmin returns (uint256) {
        require(bytes(title).length > 0, "Title is required");
        require(totalCopies > 0, "Copies must be greater than zero");

        uint256 bookId = nextBookId++;
        books[bookId] = Book({
            id: bookId,
            title: title,
            author: author,
            isbn: isbn,
            totalCopies: totalCopies,
            availableCopies: totalCopies,
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        bookIds.push(bookId);

        emit BookAdded(bookId, title, totalCopies);
        return bookId;
    }

    function updateBook(
        uint256 bookId,
        string calldata title,
        string calldata author,
        string calldata isbn,
        uint256 totalCopies,
        bool active
    ) external onlyAdmin {
        Book storage book = books[bookId];
        require(book.id != 0, "Book does not exist");
        require(bytes(title).length > 0, "Title is required");
        require(totalCopies >= book.totalCopies - book.availableCopies, "Total copies below borrowed count");

        uint256 borrowedCopies = book.totalCopies - book.availableCopies;
        book.title = title;
        book.author = author;
        book.isbn = isbn;
        book.totalCopies = totalCopies;
        book.availableCopies = totalCopies - borrowedCopies;
        book.active = active;
        book.updatedAt = block.timestamp;

        emit BookUpdated(bookId, title, totalCopies, active);
    }

    function borrowBook(uint256 bookId) external onlyActiveUser returns (uint256) {
        Book storage book = books[bookId];
        require(book.id != 0 && book.active, "Book is unavailable");
        require(book.availableCopies > 0, "No copies available");
        require(!_hasOpenBorrow(msg.sender, bookId), "Book already borrowed by this user");

        book.availableCopies -= 1;
        book.updatedAt = block.timestamp;

        uint256 recordId = nextRecordId++;
        borrowRecords[recordId] = BorrowRecord({
            id: recordId,
            bookId: bookId,
            user: msg.sender,
            borrowedAt: block.timestamp,
            returnedAt: 0,
            returned: false
        });
        userRecordIds[msg.sender].push(recordId);
        bookRecordIds[bookId].push(recordId);

        emit BookBorrowed(recordId, bookId, msg.sender);
        return recordId;
    }

    function returnBook(uint256 recordId) external onlyActiveUser {
        BorrowRecord storage record = borrowRecords[recordId];
        require(record.id != 0, "Record does not exist");
        require(record.user == msg.sender || users[msg.sender].role == Role.Admin, "Not allowed");
        require(!record.returned, "Book already returned");

        record.returned = true;
        record.returnedAt = block.timestamp;

        Book storage book = books[record.bookId];
        book.availableCopies += 1;
        book.updatedAt = block.timestamp;

        emit BookReturned(recordId, record.bookId, record.user);
    }

    function getBook(uint256 bookId) external view returns (Book memory) {
        require(books[bookId].id != 0, "Book does not exist");
        return books[bookId];
    }

    function getBooks() external view returns (Book[] memory) {
        Book[] memory result = new Book[](bookIds.length);
        for (uint256 i = 0; i < bookIds.length; i++) {
            result[i] = books[bookIds[i]];
        }
        return result;
    }

    function getUser(address wallet) external view returns (LibraryUser memory) {
        return users[wallet];
    }

    function getUsers() external view onlyAdmin returns (LibraryUser[] memory) {
        LibraryUser[] memory result = new LibraryUser[](userAddresses.length);
        for (uint256 i = 0; i < userAddresses.length; i++) {
            result[i] = users[userAddresses[i]];
        }
        return result;
    }

    function getBorrowRecord(uint256 recordId) external view returns (BorrowRecord memory) {
        require(borrowRecords[recordId].id != 0, "Record does not exist");
        return borrowRecords[recordId];
    }

    function getMyBorrowRecords() external view returns (BorrowRecord[] memory) {
        return _recordsFor(userRecordIds[msg.sender]);
    }

    function getBorrowRecordsByUser(address wallet) external view onlyAdmin returns (BorrowRecord[] memory) {
        return _recordsFor(userRecordIds[wallet]);
    }

    function getBorrowRecordsByBook(uint256 bookId) external view onlyAdmin returns (BorrowRecord[] memory) {
        require(books[bookId].id != 0, "Book does not exist");
        return _recordsFor(bookRecordIds[bookId]);
    }

    function getAllBorrowRecords() external view onlyAdmin returns (BorrowRecord[] memory) {
        BorrowRecord[] memory result = new BorrowRecord[](nextRecordId - 1);
        for (uint256 i = 1; i < nextRecordId; i++) {
            result[i - 1] = borrowRecords[i];
        }
        return result;
    }

    function _upsertUser(
        address wallet,
        string memory fullName,
        string memory email,
        Role role,
        bool active
    ) private {
        if (!knownUser[wallet]) {
            userAddresses.push(wallet);
            knownUser[wallet] = true;
        }

        uint256 createdAt = users[wallet].createdAt == 0 ? block.timestamp : users[wallet].createdAt;
        users[wallet] = LibraryUser({
            wallet: wallet,
            fullName: fullName,
            email: email,
            role: role,
            active: active,
            createdAt: createdAt
        });

        if (createdAt == block.timestamp) {
            emit UserRegistered(wallet, fullName, role);
        } else {
            emit UserUpdated(wallet, fullName, role, active);
        }
    }

    function _recordsFor(uint256[] storage ids) private view returns (BorrowRecord[] memory) {
        BorrowRecord[] memory result = new BorrowRecord[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = borrowRecords[ids[i]];
        }
        return result;
    }

    function _hasOpenBorrow(address wallet, uint256 bookId) private view returns (bool) {
        uint256[] storage ids = userRecordIds[wallet];
        for (uint256 i = 0; i < ids.length; i++) {
            BorrowRecord storage record = borrowRecords[ids[i]];
            if (record.bookId == bookId && !record.returned) {
                return true;
            }
        }
        return false;
    }
}
