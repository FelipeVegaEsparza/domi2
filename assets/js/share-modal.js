class ShareModal {
  constructor(options = {}) {
    this.modal = null;
    this.options = {
      title: document.title || 'Compartir',
      url: window.location.href,
      ...options
    };
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    if (document.getElementById('share-modal')) {
      this.modal = document.getElementById('share-modal');
      return;
    }

    const encodedUrl = encodeURIComponent(this.options.url);
    const encodedTitle = encodeURIComponent(this.options.title);

    const networks = [
      { name: 'Facebook', icon: 'fab fa-facebook-f', cls: 'facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
      { name: 'X', icon: 'fab fa-x-twitter', cls: 'twitter', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
      { name: 'WhatsApp', icon: 'fab fa-whatsapp', cls: 'whatsapp', url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
      { name: 'Telegram', icon: 'fab fa-telegram-plane', cls: 'telegram', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
      { name: 'LinkedIn', icon: 'fab fa-linkedin-in', cls: 'linkedin', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
      { name: 'Email', icon: 'fas fa-envelope', cls: 'email', url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
    ];

    const networksHTML = networks.map(n => `
      <button class="share-modal-btn ${n.cls}" data-url="${n.url}">
        <i class="${n.icon}"></i>
        <span>${n.name}</span>
      </button>
    `).join('');

    const nativeShare = navigator.share ? `
      <button class="share-modal-native" id="share-modal-native">
        <i class="fas fa-share-alt"></i>
        <span>Compartir con...</span>
      </button>
    ` : '';

    const modalHTML = `
      <div class="share-modal-overlay" id="share-modal">
        <div class="share-modal-content">
          <button class="share-modal-close" id="share-modal-close">
            <i class="fas fa-times"></i>
          </button>
          <div class="share-modal-header">
            <h3>Compartir</h3>
            <p>Comparte esta radio con tus amigos</p>
          </div>
          <div class="share-modal-grid">
            ${networksHTML}
          </div>
          <div class="share-modal-actions">
            <button class="share-modal-copy" id="share-modal-copy">
              <i class="fas fa-link"></i>
              <span>Copiar enlace</span>
            </button>
            ${nativeShare}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('share-modal');
  }

  setupEventListeners() {
    document.getElementById('share-modal-close').addEventListener('click', () => this.hide());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    document.querySelectorAll('.share-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = btn.dataset.url;
        window.open(url, '_blank', 'width=600,height=500');
      });
    });

    document.getElementById('share-modal-copy').addEventListener('click', () => this.copyLink());

    const nativeBtn = document.getElementById('share-modal-native');
    if (nativeBtn) {
      nativeBtn.addEventListener('click', () => this.nativeShare());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.hide();
      }
    });
  }

  show() {
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.options.url);
      const btn = document.getElementById('share-modal-copy');
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fas fa-check"></i><span>Copiado</span>';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fas fa-link"></i><span>Copiar enlace</span>';
      }, 2500);
    } catch {
      fallbackCopy(this.options.url);
    }
  }

  nativeShare() {
    if (navigator.share) {
      navigator.share({ title: this.options.title, url: this.options.url });
    }
    this.hide();
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } catch (e) {
    console.error('Fallback copy failed', e);
  }
  document.body.removeChild(textarea);
}
