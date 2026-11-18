const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzzItY6u4XhPpvxUz4ow5qYbCSEpvdPrpTorD1VNTSdldioGsd4JHjwq_yopI-VpmsZ9w/exec';

document.addEventListener("DOMContentLoaded", function () {
    // 1. KHỞI TẠO TẤT CẢ CÁC MODULE KHI DOM ĐÃ SẴN SÀNG
    setupUnifiedAudioPlayer();
    startCountdown('2026-12-06T17:00:00+07:00');
    setupScrollReveal();
    setupQrModal();
    setupFormRSVP();
    
    // 2. KHỞI CHẠY HIỆU ỨNG TRÁI TIM BAY LÊN
    setInterval(createFloatingHeart, 400);
});


// ==========================================
// 1. BỘ PHÁT NHẠC THỐNG NHẤT (AUTOPLAY & TOGGLE)
// ==========================================
function setupUnifiedAudioPlayer() {
    const audio = document.getElementById("wedding-audio");
    const musicBtn = document.getElementById("musicControl");
    
    if (!audio || !musicBtn) return;

    audio.volume = 0.8;
    let isPlaying = false;

    function playMusic() {
      if (isPlaying) return;

      audio.play().then(() => {
        isPlaying = true;
        musicBtn.classList.remove("paused");
        musicBtn.classList.add("playing");
        
        // Gỡ bỏ các sự kiện sau khi đã phát thành công
        ["click", "touchend", "pointerdown"].forEach(evt => {
          document.removeEventListener(evt, handleFirstInteraction);
        });
      }).catch((err) => {
        console.log("Trình duyệt đang chặn autoplay, chờ tương tác...", err);
      });
    }

    function handleFirstInteraction() {
      playMusic();
    }

    // Thử phát ngay khi tải trang
    playMusic();

    // Lắng nghe chạm/click đầu tiên để mở khóa âm thanh trên mobile/desktop
    ["click", "touchend", "pointerdown"].forEach(evt => {
      document.addEventListener(evt, handleFirstInteraction, { passive: true });
    });

    // Bấm trực tiếp vào nút nhạc để Bật/Tắt thủ công
    musicBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (audio.paused) {
        audio.play().then(() => {
          isPlaying = true;
          musicBtn.classList.remove("paused");
          musicBtn.classList.add("playing");
        });
      } else {
        audio.pause();
        isPlaying = false;
        musicBtn.classList.add("paused");
        musicBtn.classList.remove("playing");
      }
    });
}


// ==========================================
// 2. ĐỒNG HỒ ĐẾM NGƯỢC
// ==========================================
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


// ==========================================
// 3. HIỆU ỨNG SCROLL REVEAL
// ==========================================
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


// ==========================================
// 4. POPUP MÃ QR
// ==========================================
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


// ==========================================
// 5. FORM RSVP GỬI GOOGLE APPS SCRIPT
// ==========================================
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

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(() => {
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


// ==========================================
// 6. HIỆU ỨNG TRÁI TIM BAY LÊN
// ==========================================
function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.innerHTML = '❤️';
    
    heart.style.left = Math.random() * 100 + 'vw';
    
    const size = Math.random() * 12 + 12;
    heart.style.fontSize = size + 'px';
    
    const duration = Math.random() * 4 + 4;
    heart.style.animationDuration = duration + 's';
    
    heart.style.opacity = Math.random() * 0.6 + 0.4;
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
      heart.remove();
    }, duration * 1000);
}