function loadReviewTours(){

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

let select =
document.getElementById(
"tourId"
);

tours.forEach(t => {

let booked =
bookings.find(

b =>

b.userId == user.id

&&

b.tourId == t.id

);

if(booked){

select.innerHTML +=

`<option value="${t.id}">
${t.name}
</option>`;

}

});
}

function submitReview(){

let user =
JSON.parse(
localStorage.getItem(
"currentUser"
));

let reviews =
JSON.parse(
localStorage.getItem(
"reviews"
)) || [];

reviews.push({

id: Date.now(),

userId:
user.id,

tourId:
Number(
tourId.value
),

rating:
Number(
rating.value
),

comment:
comment.value

});

localStorage.setItem(
"reviews",
JSON.stringify(reviews)
);

alert(
"Đánh giá thành công"
);

loadReviews();
}

function loadReviews(){

let reviews =
JSON.parse(
localStorage.getItem(
"reviews"
)) || [];

let tours =
JSON.parse(
localStorage.getItem(
"tours"
)) || [];

let html = "";

reviews.forEach(r => {

let tour =
tours.find(
t => t.id == r.tourId
);

html += `

<div class="card">

<h3>
${tour.name}
</h3>

<p>
⭐ ${r.rating}/5
</p>

<p>
${r.comment}
</p>

</div>

`;

});

document.getElementById(
"reviewList"
).innerHTML = html;
}