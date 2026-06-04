function bookTour(tourId){

let currentUser =
JSON.parse(
localStorage.getItem(
"currentUser"
));

if(!currentUser){

alert(
"Vui lòng đăng nhập"
);

location.href =
"login.html";

return;
}

let bookings =
JSON.parse(
localStorage.getItem(
"bookings"
)) || [];

bookings.push({

id: Date.now(),

userId:
currentUser.id,

tourId:
tourId,

bookingDate:
new Date()
.toLocaleString(),

status:
"Đã đặt"

});

localStorage.setItem(
"bookings",
JSON.stringify(bookings)
);

alert(
"Đặt tour thành công"
);
}

// Hiển thị lịch sử

function loadHistory(){

let user =
JSON.parse(
localStorage.getItem(
"currentUser"
));

let bookings =
JSON.parse(
localStorage.getItem(
"bookings"
)) || [];

let tours =
JSON.parse(
localStorage.getItem(
"tours"
)) || [];

let html = "";

bookings
.filter(
b => b.userId == user.id
)
.forEach(b => {

let tour =
tours.find(
t => t.id == b.tourId
);

html += `

<div class="card">

<h3>
${tour.name}
</h3>

<p>
${b.bookingDate}
</p>

<p>
${b.status}
</p>

</div>

`;

});

document.getElementById(
"historyList"
).innerHTML = html;
}