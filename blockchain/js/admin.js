// Kiểm tra quyền admin

let user =
JSON.parse(
localStorage.getItem(
"currentUser"
));

if(
!user ||
user.role !== "admin"
){

alert(
"Không có quyền truy cập"
);

location.href =
"index.html";
}

// Hiển thị danh sách tour

function loadTours(){

let tours =
JSON.parse(
localStorage.getItem(
"tours"
)) || [];

let html = "";

tours.forEach(t => {

html += `

<div class="card">

<h3>${t.name}</h3>

<p>📍 ${t.location}</p>

<p>
💰 ${Number(t.price)
.toLocaleString()} VNĐ
</p>

<p>
${t.description || ""}
</p>

<button
onclick="editTour(${t.id})">
Sửa
</button>

<button
onclick="deleteTour(${t.id})">
Xóa
</button>

</div>

`;

});

document.getElementById(
"tourList"
).innerHTML = html;
}

// Thêm tour

function addTour(){

let tours =
JSON.parse(
localStorage.getItem(
"tours"
)) || [];

let newTour = {

id: Date.now(),

name:
document.getElementById(
"name"
).value,

location:
document.getElementById(
"location"
).value,

price:
document.getElementById(
"price"
).value,

description:
document.getElementById(
"description"
).value

};

tours.push(newTour);

localStorage.setItem(
"tours",
JSON.stringify(tours)
);

alert(
"Thêm tour thành công"
);

clearForm();

loadTours();
}

// Xóa tour

function deleteTour(id){

if(
!confirm(
"Bạn có chắc muốn xóa?"
)
){
return;
}

let tours =
JSON.parse(
localStorage.getItem(
"tours"
));

tours =
tours.filter(
t => t.id !== id
);

localStorage.setItem(
"tours",
JSON.stringify(tours)
);

loadTours();
}

// Sửa tour

function editTour(id){

let tours =
JSON.parse(
localStorage.getItem(
"tours"
));

let tour =
tours.find(
t => t.id === id
);

let newName =
prompt(
"Tên tour",
tour.name
);

if(newName === null)
return;

let newLocation =
prompt(
"Địa điểm",
tour.location
);

if(newLocation === null)
return;

let newPrice =
prompt(
"Giá tour",
tour.price
);

if(newPrice === null)
return;

let newDescription =
prompt(
"Mô tả",
tour.description
);

tour.name =
newName;

tour.location =
newLocation;

tour.price =
newPrice;

tour.description =
newDescription;

localStorage.setItem(
"tours",
JSON.stringify(tours)
);

alert(
"Cập nhật thành công"
);

loadTours();
}

// Xóa dữ liệu form

function clearForm(){

document.getElementById(
"name"
).value = "";

document.getElementById(
"location"
).value = "";

document.getElementById(
"price"
).value = "";

document.getElementById(
"description"
).value = "";
}

// Khởi tạo

loadTours();