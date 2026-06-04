let tours =
JSON.parse(
localStorage.getItem(
"tours"
)) || [];

if(tours.length === 0){

tours = [

{
id:1,
name:"Tour Đà Nẵng",
location:"Đà Nẵng",
price:3500000,
description:"3 ngày 2 đêm"
},

{
id:2,
name:"Tour Hạ Long",
location:"Quảng Ninh",
price:2800000,
description:"Khám phá vịnh Hạ Long"
},

{
id:3,
name:"Tour Đà Lạt",
location:"Lâm Đồng",
price:3200000,
description:"Thành phố ngàn hoa"
}

];

localStorage.setItem(
"tours",
JSON.stringify(tours)
);
}

function renderTours(){

let html = "";

tours.forEach(t => {

html += `

<div class="tour-card">

<h2>${t.name}</h2>

<p>📍 ${t.location}</p>

<p>
💰 ${Number(t.price)
.toLocaleString()} VNĐ
</p>

<p>
${t.description}
</p>

<button
onclick="bookTour(
${t.id}
)">
Đặt tour
</button>

</div>

`;

});

document.getElementById(
"tourList"
).innerHTML = html;
}

renderTours();