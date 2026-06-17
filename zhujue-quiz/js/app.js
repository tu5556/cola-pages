// 《主角》问答 H5 — 主控逻辑

const App = {
  state: {
    phase: 'loading',
    currentQ: 0,
    score: 0,
    answers: []
  },

  init() {
    AudioManager.init();
    this.bindEvents();
    // Loading → Home after 1.8s
    setTimeout(() => this.go('home'), 1800);
  },

  go(phase) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${phase}`);
    if (target) target.classList.add('active');
    this.state.phase = phase;

    // BGM
    AudioManager.stopBGM();
    if (phase === 'home') AudioManager.startBGM('home');
    if (phase === 'quiz') AudioManager.startBGM('quiz');
    if (phase === 'result') AudioManager.startBGM('result');

    if (phase === 'quiz') {
      this.state.currentQ = 0;
      this.state.score = 0;
      this.state.answers = [];
      this.renderQuestion();
    }
    if (phase === 'result') {
      this.renderResult();
    }
  },

  bindEvents() {
    // Home CTA
    document.getElementById('btn-start').addEventListener('click', () => {
      AudioManager.unlock();
      AudioManager.btnTap();
      this.go('quiz');
    });

    // Audio toggle
    document.getElementById('audio-toggle').addEventListener('click', () => {
      AudioManager.toggle();
    });

    // Share close
    document.getElementById('share-close').addEventListener('click', () => {
      ShareManager.hide();
    });

    // Retry
    document.getElementById('btn-retry').addEventListener('click', () => {
      this.go('home');
    });

    // Share overlay tap to close
    document.getElementById('share-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) ShareManager.hide();
    });
  },

  // --- Quiz ---
  renderQuestion() {
    const i = this.state.currentQ;
    const q = QUIZ_DATA[i];
    const total = QUIZ_DATA.length;

    document.getElementById('progress-fill').style.width = `${((i) / total) * 100}%`;
    document.getElementById('progress-num').textContent = `${i + 1}/${total}`;

    const card = document.getElementById('quiz-card');
    card.innerHTML = `
      <div class="question-text">${q.q}</div>
      <div class="options-list">
        ${q.opts.map((opt, oi) => `
          <button class="option-btn" data-index="${oi}">${opt}</button>
        `).join('')}
      </div>
    `;
    card.style.animation = 'none';
    card.offsetHeight; // reflow
    card.style.animation = 'slideUp 0.4s ease';

    // Bind option clicks
    card.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleAnswer(parseInt(e.target.dataset.index)));
    });
  },

  handleAnswer(selected) {
    const q = QUIZ_DATA[this.state.currentQ];
    const correct = selected === q.a;
    if (correct) this.state.score++;
    this.state.answers.push({ qid: q.id, selected, correct });

    // Visual feedback
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.classList.add('disabled'));
    btns[q.a].classList.add('correct');
    if (!correct) btns[selected].classList.add('wrong');

    // Audio
    if (correct) AudioManager.correct(); else AudioManager.wrong();

    // Auto advance
    setTimeout(() => {
      this.state.currentQ++;
      if (this.state.currentQ >= QUIZ_DATA.length) {
        AudioManager.reveal();
        this.go('result');
      } else {
        AudioManager.slide();
        this.renderQuestion();
      }
    }, 800);
  },

  // --- Result ---
  renderResult() {
    const { score } = this.state;
    const total = QUIZ_DATA.length;
    const tier = RESULT_TIERS.find(t => score >= t.min && score <= t.max) || RESULT_TIERS[0];

    document.getElementById('result-title').textContent = `「${tier.title}」`;
    document.getElementById('result-score').textContent = `${score} / ${total}`;
    document.getElementById('result-desc').textContent = tier.desc;

    document.getElementById('btn-share').onclick = () => {
      AudioManager.btnTap();
      ShareManager.generate(score, total, tier);
    };
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
