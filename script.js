const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzzItY6u4XhPpvxUz4ow5qYbCSEpvdPrpTorD1VNTSdldioGsd4JHjwq_yopI-VpmsZ9w/exec';

document.addEventListener('DOMContentLoaded', () => {
  // 1. LẤY TÊN KHÁCH MỜI TỪ URL (?to=Tên hoặc ?khach=Tên)
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || urlParams.get('khach');

  if (guestName) {
    const decodedName = decodeURIComponent(guestName.replace(/\+/g, ' '));
    const guestElem = document.getElementById('guestName');
    if (guestElem) guestElem.innerText = decodedName;

    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = decodedName;
  }

  // 2. ĐỒNG HỒ ĐẾM NGƯỢC TỚI 17:00 NGÀY 06/12/2026
  startCountdown('2026-12-06T17:00:00+07:00');

  // 3. HIỆU ỨNG SCROLL REVEAL
  setupScrollReveal();

  // 4. PHÁT NHẠC NỀN
  setupMusicPlayer();

  // 5. POPUP MÃ QR
  setupQrModal();

  // 6. FORM RSVP
  setupFormRSVP();
});

function startCountdown(targetDateStr) {
  const targetTime = new Date(targetDateStr).getTime();
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl) return;

  const updateTimer = () => {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minutesEl.innerText = String(minutes).padStart(2, '0');
    secondsEl.innerText = String(seconds).padStart(2, '0');
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}

function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => observer.observe(el));
}

function setupQrModal() {
  const openQrBtn = document.getElementById('openQrBtn');
  const closeQrBtn = document.getElementById('closeQrBtn');
  const qrModal = document.getElementById('qrModal');

  if (openQrBtn && qrModal) {
    openQrBtn.addEventListener('click', () => qrModal.classList.add('active'));
  }

  if (closeQrBtn && qrModal) {
    closeQrBtn.addEventListener('click', () => qrModal.classList.remove('active'));
  }

  if (qrModal) {
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) qrModal.classList.remove('active');
    });
  }
}

function setupMusicPlayer() {
  const musicBtn = document.getElementById('musicControl');
  const bgMusic = document.getElementById('bgMusic');

  if (!musicBtn || !bgMusic) return;

  musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicBtn.classList.remove('paused');
      musicBtn.classList.add('playing');
    } else {
      bgMusic.pause();
      musicBtn.classList.remove('playing');
      musicBtn.classList.add('paused');
    }
  });

  const startAudioOnInteraction = () => {
    if (bgMusic.paused && musicBtn.classList.contains('paused')) {
      bgMusic.play().then(() => {
        musicBtn.classList.remove('paused');
        musicBtn.classList.add('playing');
      }).catch(() => {});
    }
    document.removeEventListener('click', startAudioOnInteraction);
    document.removeEventListener('touchstart', startAudioOnInteraction);
  };

  document.addEventListener('click', startAudioOnInteraction);
  document.addEventListener('touchstart', startAudioOnInteraction);
}

// XỬ LÝ GỬI FORM RSVP
function setupFormRSVP() {
  const form = document.getElementById('rsvpForm');
  const btnSubmit = document.getElementById('btnSubmit');
  const statusMsg = document.getElementById('statusMessage');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    btnSubmit.disabled = true;
    btnSubmit.innerText = 'ĐANG GỬI...';
    statusMsg.className = 'status-msg';

    const payload = {
      name: document.getElementById('name').value.trim(),
      attend: document.getElementById('attend').value,
      count: document.getElementById('count').value,
      note: document.getElementById('note').value.trim(),
      wishes: document.getElementById('wishes').value.trim()
    };

    // Gửi trực tiếp dưới dạng JSON (tránh lỗi encode URLSearchParams với Google Apps Script)
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Cần thiết khi gọi Google Apps Script Web App trực tiếp từ domain khác
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(() => {
      // Vì dùng mode 'no-cors', ta không đọc trực tiếp response JSON được nhưng request đã lên thành công
      statusMsg.className = 'status-msg success';
      statusMsg.innerText = 'Cảm ơn bạn đã xác nhận và gửi lời chúc!';
      form.reset();
    })
    .catch(err => {
      console.error('Lỗi:', err);
      statusMsg.className = 'status-msg error';
      statusMsg.innerText = 'Có lỗi xảy ra, vui lòng thử lại!';
    })
    .finally(() => {
      btnSubmit.disabled = false;
      btnSubmit.innerText = 'GỬI XÁC NHẬN';
    });
  });
}

  function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    
    // Ký tự trái tim
    heart.innerHTML = '❤️';
    
    // Vị trí xuất hiện ngẫu nhiên theo chiều ngang màn hình
    heart.style.left = Math.random() * 100 + 'vw';
    
    // Kích thước trái tim ngẫu nhiên (từ 12px đến 24px)
    const size = Math.random() * 12 + 12;
    heart.style.fontSize = size + 'px';
    
    // Thời gian bay lên ngẫu nhiên (từ 4 giây đến 8 giây cho độ uyển chuyển)
    const duration = Math.random() * 4 + 4;
    heart.style.animationDuration = duration + 's';
    
    // Độ mờ ngẫu nhiên
    heart.style.opacity = Math.random() * 0.6 + 0.4;
    
    document.body.appendChild(heart);
    
    // Tự động xóa sau khi bay xong để tối ưu hiệu năng
    setTimeout(() => {
      heart.remove();
    }, duration * 1000);
  }

  // Tạo liên tục trái tim cứ mỗi 400 mili-giây
  setInterval(createFloatingHeart, 400);

  