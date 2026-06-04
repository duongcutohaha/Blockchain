function createToastContainer(){
    if(document.getElementById('toastContainer')) return;
    let container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
}

function showToast(message, type = 'info'){
    createToastContainer();
    let container = document.getElementById('toastContainer');
    let toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"></div>
        <div class="toast-content">
            <p>${message}</p>
        </div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3800);
}

function toastSuccess(message){ showToast(message, 'success'); }
function toastError(message){ showToast(message, 'error'); }
function toastInfo(message){ showToast(message, 'info'); }
