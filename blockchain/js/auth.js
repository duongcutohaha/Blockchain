// Đăng ký

function register(){

let fullname =
document.getElementById(
"fullname"
).value;

let email =
document.getElementById(
"email"
).value;

let password =
document.getElementById(
"password"
).value;

let users =
JSON.parse(
localStorage.getItem(
"users"
)) || [];

let check =
users.find(
u => u.email === email
);

if(check){

alert(
"Email đã tồn tại"
);

return;
}

users.push({

id: Date.now(),

fullname,

email,

password,

role:"user"

});

localStorage.setItem(
"users",
JSON.stringify(users)
);

alert(
"Đăng ký thành công"
);

location.href =
"login.html";
}

// Đăng nhập

function login(){

let email =
document.getElementById(
"email"
).value;

let password =
document.getElementById(
"password"
).value;

let users =
JSON.parse(
localStorage.getItem(
"users"
)) || [];

let user =
users.find(

u =>

u.email === email

&&

u.password === password

);

if(user){

localStorage.setItem(
"currentUser",
JSON.stringify(user)
);

location.href =
"index.html";
}
else{

alert(
"Sai tài khoản hoặc mật khẩu"
);

}
}

// Đăng xuất

function logout(){

localStorage.removeItem(
"currentUser"
);

location.href =
"login.html";
}