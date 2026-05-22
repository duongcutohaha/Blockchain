import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  CheckCircle2,
  History,
  Library,
  Loader2,
  LogIn,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Shield,
  User,
  Users
} from "lucide-react";
import { BrowserProvider, Contract } from "ethers";
import contractMetadata from "./contracts/libraryManagement.json";
import "./styles.css";

const ROLE = {
  0: "Chưa đăng ký",
  1: "User",
  2: "Admin"
};

const initialBookForm = {
  title: "",
  author: "",
  isbn: "",
  totalCopies: "1",
  active: true
};

const initialUserForm = {
  wallet: "",
  fullName: "",
  email: "",
  role: "1",
  active: true
};

function toNumber(value) {
  return Number(value?.toString?.() ?? value ?? 0);
}

function formatDate(timestamp) {
  const value = toNumber(timestamp);
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value * 1000));
}

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normalizeBook(book) {
  return {
    id: toNumber(book.id),
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    totalCopies: toNumber(book.totalCopies),
    availableCopies: toNumber(book.availableCopies),
    active: book.active,
    createdAt: toNumber(book.createdAt),
    updatedAt: toNumber(book.updatedAt)
  };
}

function normalizeUser(user) {
  return {
    wallet: user.wallet,
    fullName: user.fullName,
    email: user.email,
    role: toNumber(user.role),
    active: user.active,
    createdAt: toNumber(user.createdAt)
  };
}

function normalizeRecord(record) {
  return {
    id: toNumber(record.id),
    bookId: toNumber(record.bookId),
    user: record.user,
    borrowedAt: toNumber(record.borrowedAt),
    returnedAt: toNumber(record.returnedAt),
    returned: record.returned
  };
}

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [editingBookId, setEditingBookId] = useState(null);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [registerForm, setRegisterForm] = useState({ fullName: "", email: "" });
  const [tab, setTab] = useState("books");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const contractReady = contractMetadata.address && contractMetadata.abi?.length;
  const isAdmin = profile?.role === 2 && profile?.active;
  const isActiveUser = profile?.active && (profile?.role === 1 || profile?.role === 2);

  const booksById = useMemo(() => {
    return books.reduce((map, book) => {
      map[book.id] = book;
      return map;
    }, {});
  }, [books]);

  const connectWallet = useCallback(async () => {
    setError("");
    if (!window.ethereum) {
      setError("Vui lòng cài MetaMask để sử dụng hệ thống.");
      return;
    }
    if (!contractReady) {
      setError("Chưa có địa chỉ contract. Hãy chạy deploy trước.");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setAccount(accounts[0]);
    setContract(new Contract(contractMetadata.address, contractMetadata.abi, signer));
  }, [contractReady]);

  const loadData = useCallback(async () => {
    if (!contract || !account) return;
    setBusy(true);
    setError("");
    try {
      const currentProfile = normalizeUser(await contract.getUser(account));
      const bookList = (await contract.getBooks()).map(normalizeBook);
      setProfile(currentProfile);
      setBooks(bookList);

      if (currentProfile.active) {
        setMyRecords((await contract.getMyBorrowRecords()).map(normalizeRecord));
      } else {
        setMyRecords([]);
      }

      if (currentProfile.role === 2 && currentProfile.active) {
        setUsers((await contract.getUsers()).map(normalizeUser));
        setRecords((await contract.getAllBorrowRecords()).map(normalizeRecord));
      } else {
        setUsers([]);
        setRecords([]);
      }
    } catch (err) {
      setError(err.shortMessage || err.reason || err.message);
    } finally {
      setBusy(false);
    }
  }, [account, contract]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || "");
      setProfile(null);
      setContract(null);
      if (accounts[0]) connectWallet();
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [connectWallet]);

  async function runTransaction(action, successText) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const tx = await action();
      await tx.wait();
      setMessage(successText);
      await loadData();
    } catch (err) {
      setError(err.shortMessage || err.reason || err.message);
    } finally {
      setBusy(false);
    }
  }

  function editBook(book) {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: String(book.totalCopies),
      active: book.active
    });
  }

  function resetBookForm() {
    setEditingBookId(null);
    setBookForm(initialBookForm);
  }

  async function saveBook(event) {
    event.preventDefault();
    const copies = Number(bookForm.totalCopies);
    if (editingBookId) {
      await runTransaction(
        () =>
          contract.updateBook(
            editingBookId,
            bookForm.title,
            bookForm.author,
            bookForm.isbn,
            copies,
            bookForm.active
          ),
        "Đã cập nhật sách."
      );
    } else {
      await runTransaction(
        () => contract.addBook(bookForm.title, bookForm.author, bookForm.isbn, copies),
        "Đã thêm sách mới."
      );
    }
    resetBookForm();
  }

  async function saveUser(event) {
    event.preventDefault();
    await runTransaction(
      () =>
        contract.addOrUpdateUser(
          userForm.wallet,
          userForm.fullName,
          userForm.email,
          Number(userForm.role),
          userForm.active
        ),
      "Đã lưu người dùng."
    );
    setUserForm(initialUserForm);
  }

  async function registerAccount(event) {
    event.preventDefault();
    await runTransaction(
      () => contract.registerMyAccount(registerForm.fullName, registerForm.email),
      "Đăng ký tài khoản thành công."
    );
    setRegisterForm({ fullName: "", email: "" });
  }

  async function borrowBook(bookId) {
    await runTransaction(() => contract.borrowBook(bookId), "Đã ghi nhận giao dịch mượn sách.");
  }

  async function returnBook(recordId) {
    await runTransaction(() => contract.returnBook(recordId), "Đã ghi nhận giao dịch trả sách.");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div className="brand">
          <Library size={30} />
          <div>
            <h1>Blockchain Library</h1>
            <p>Quản lý sách, người dùng và lịch sử mượn/trả trên Ethereum</p>
          </div>
        </div>
        <div className="wallet-panel">
          {account && (
            <span className="role-pill">
              {profile?.role === 2 ? <Shield size={16} /> : <User size={16} />}
              {ROLE[profile?.role ?? 0]}
            </span>
          )}
          <button className="primary-button" onClick={connectWallet} disabled={busy}>
            <LogIn size={18} />
            {account ? shortAddress(account) : "Kết nối MetaMask"}
          </button>
          <button className="icon-button" onClick={loadData} disabled={!contract || busy} title="Tải lại">
            {busy ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
          </button>
        </div>
      </section>

      {!contractReady && (
        <div className="notice error">
          Chưa tìm thấy địa chỉ contract. Chạy `npm run deploy:ganache` sau khi mở Ganache.
        </div>
      )}
      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      {!account ? (
        <section className="empty-state">
          <BookOpen size={46} />
          <h2>Kết nối ví để bắt đầu</h2>
          <p>MetaMask sẽ dùng địa chỉ ví của bạn để xác định quyền Admin hoặc User.</p>
        </section>
      ) : (
        <div className="workspace">
          <aside className="sidebar">
            <button className={tab === "books" ? "active" : ""} onClick={() => setTab("books")}>
              <BookOpen size={18} /> Sách
            </button>
            <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
              <History size={18} /> Lịch sử
            </button>
            {isAdmin && (
              <>
                <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
                  <Users size={18} /> Người dùng
                </button>
                <button className={tab === "admin" ? "active" : ""} onClick={() => setTab("admin")}>
                  <Shield size={18} /> Quản lý sách
                </button>
              </>
            )}
          </aside>

          <section className="content">
            {!profile?.active && <RegistrationPanel form={registerForm} setForm={setRegisterForm} onSubmit={registerAccount} busy={busy} />}
            {tab === "books" && (
              <BookList
                books={books}
                isActiveUser={isActiveUser}
                myRecords={myRecords}
                onBorrow={borrowBook}
                busy={busy}
              />
            )}
            {tab === "history" && (
              <HistoryTable
                records={isAdmin ? records : myRecords}
                booksById={booksById}
                showUser={isAdmin}
                onReturn={returnBook}
                canReturn={isActiveUser}
                busy={busy}
              />
            )}
            {tab === "users" && isAdmin && (
              <UsersPanel users={users} form={userForm} setForm={setUserForm} onSubmit={saveUser} busy={busy} />
            )}
            {tab === "admin" && isAdmin && (
              <AdminBooksPanel
                books={books}
                form={bookForm}
                setForm={setBookForm}
                editingBookId={editingBookId}
                onEdit={editBook}
                onReset={resetBookForm}
                onSubmit={saveBook}
                busy={busy}
              />
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function RegistrationPanel({ form, setForm, onSubmit, busy }) {
  return (
    <section className="panel registration">
      <div>
        <h2>Đăng ký tài khoản User</h2>
        <p>Ví hiện tại chưa có hồ sơ người dùng. Hoàn tất thông tin để mượn/trả sách.</p>
      </div>
      <form className="inline-form" onSubmit={onSubmit}>
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Họ tên" required />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <button className="primary-button" disabled={busy}>
          <Save size={17} /> Đăng ký
        </button>
      </form>
    </section>
  );
}

function BookList({ books, isActiveUser, myRecords, onBorrow, busy }) {
  const borrowedBookIds = new Set(myRecords.filter((record) => !record.returned).map((record) => record.bookId));
  return (
    <section>
      <div className="section-title">
        <h2>Danh sách sách</h2>
        <span>{books.length} đầu sách</span>
      </div>
      <div className="book-grid">
        {books.map((book) => {
          const borrowed = borrowedBookIds.has(book.id);
          const canBorrow = isActiveUser && book.active && book.availableCopies > 0 && !borrowed;
          return (
            <article className="book-card" key={book.id}>
              <div className="book-meta">
                <span>#{book.id}</span>
                <span className={book.active ? "status ok" : "status muted"}>{book.active ? "Đang phục vụ" : "Tạm khóa"}</span>
              </div>
              <h3>{book.title}</h3>
              <p>{book.author || "Chưa cập nhật tác giả"}</p>
              <p className="isbn">ISBN: {book.isbn || "-"}</p>
              <div className="copy-row">
                <strong>{book.availableCopies}</strong>
                <span>/ {book.totalCopies} bản khả dụng</span>
              </div>
              <button className="primary-button" disabled={!canBorrow || busy} onClick={() => onBorrow(book.id)}>
                <BookOpen size={17} />
                {borrowed ? "Đang mượn" : "Mượn sách"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HistoryTable({ records, booksById, showUser, onReturn, canReturn, busy }) {
  return (
    <section className="panel">
      <div className="section-title">
        <h2>Lịch sử mượn/trả</h2>
        <span>{records.length} giao dịch</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Sách</th>
              {showUser && <th>Người mượn</th>}
              <th>Ngày mượn</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>#{record.id}</td>
                <td>{booksById[record.bookId]?.title || `Sách #${record.bookId}`}</td>
                {showUser && <td>{shortAddress(record.user)}</td>}
                <td>{formatDate(record.borrowedAt)}</td>
                <td>{formatDate(record.returnedAt)}</td>
                <td>
                  <span className={record.returned ? "status ok" : "status warn"}>
                    {record.returned ? "Đã trả" : "Đang mượn"}
                  </span>
                </td>
                <td>
                  {!record.returned && canReturn && (
                    <button className="small-button" onClick={() => onReturn(record.id)} disabled={busy}>
                      <RotateCcw size={15} /> Trả
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan={showUser ? 7 : 6} className="empty-cell">Chưa có giao dịch.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UsersPanel({ users, form, setForm, onSubmit, busy }) {
  return (
    <section className="split-layout">
      <div className="panel">
        <div className="section-title">
          <h2>Danh sách người dùng</h2>
          <span>{users.length} ví</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ví</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Quyền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.wallet}>
                  <td>{shortAddress(user.wallet)}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email || "-"}</td>
                  <td>{ROLE[user.role]}</td>
                  <td><span className={user.active ? "status ok" : "status muted"}>{user.active ? "Hoạt động" : "Khóa"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <form className="panel form-panel" onSubmit={onSubmit}>
        <h2>Thêm / cập nhật người dùng</h2>
        <input value={form.wallet} onChange={(e) => setForm({ ...form, wallet: e.target.value })} placeholder="Địa chỉ ví" required />
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Họ tên" required />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="1">User</option>
          <option value="2">Admin</option>
        </select>
        <label className="check-row">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Cho phép hoạt động
        </label>
        <button className="primary-button" disabled={busy}>
          <Save size={17} /> Lưu người dùng
        </button>
      </form>
    </section>
  );
}

function AdminBooksPanel({ books, form, setForm, editingBookId, onEdit, onReset, onSubmit, busy }) {
  return (
    <section className="split-layout">
      <div className="panel">
        <div className="section-title">
          <h2>Kho sách</h2>
          <span>{books.length} đầu sách</span>
        </div>
        <div className="admin-book-list">
          {books.map((book) => (
            <button key={book.id} className="book-row" onClick={() => onEdit(book)}>
              <span>{book.title}</span>
              <small>{book.availableCopies}/{book.totalCopies} bản</small>
              <CheckCircle2 size={17} className={book.active ? "green" : "muted-icon"} />
            </button>
          ))}
        </div>
      </div>
      <form className="panel form-panel" onSubmit={onSubmit}>
        <h2>{editingBookId ? `Cập nhật sách #${editingBookId}` : "Thêm sách mới"}</h2>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tên sách" required />
        <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Tác giả" />
        <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="ISBN" />
        <input type="number" min="1" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} placeholder="Số lượng" required />
        <label className="check-row">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Sách đang phục vụ
        </label>
        <div className="button-row">
          <button className="primary-button" disabled={busy}>
            {editingBookId ? <Save size={17} /> : <Plus size={17} />}
            {editingBookId ? "Cập nhật" : "Thêm sách"}
          </button>
          {editingBookId && (
            <button type="button" className="secondary-button" onClick={onReset}>
              Hủy
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
