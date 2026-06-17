// 《主角》问答 H5 — 分享图生成

const ShareManager = {
  async generate(score, total, tier) {
    const overlay = document.getElementById('share-overlay');
    const img = document.getElementById('share-img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. 绘制背景图
    const bg = new Image();
    bg.crossOrigin = 'anonymous';
    bg.src = 'assets/images/bg-share.jpg';
    await new Promise((resolve, reject) => { bg.onload = resolve; bg.onerror = reject; });
    ctx.drawImage(bg, 0, 0, W, H);

    // 2. 暗色遮罩（下半部分）
    const grad = ctx.createLinearGradient(0, H * 0.5, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.6, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 3. 称号
    ctx.fillStyle = '#D4A84B';
    ctx.font = 'bold 96px "Noto Serif SC", "STSong", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`「${tier.title}」`, W / 2, H * 0.6);

    // 4. 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px "Georgia", serif';
    ctx.fillText(`${score} / ${total}`, W / 2, H * 0.6 + 160);

    // 5. 评语
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '36px "PingFang SC", system-ui, sans-serif';
    const words = tier.desc.split('');
    let line = '', y = H * 0.6 + 280;
    for (const ch of words) {
      const test = line + ch;
      if (ctx.measureText(test).width > W * 0.75) {
        ctx.fillText(line, W / 2, y);
        line = ch;
        y += 56;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, W / 2, y);

    // 6. 底部引导
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '28px "PingFang SC", system-ui, sans-serif';
    ctx.fillText('📺 《主角》问答挑战 · 扫码也来测一测', W / 2, H - 120);

    // 7. 显示
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    img.src = dataUrl;
    overlay.classList.add('active');
    AudioManager.done();
  },

  hide() {
    document.getElementById('share-overlay').classList.remove('active');
  }
};
