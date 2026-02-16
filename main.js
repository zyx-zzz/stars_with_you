document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 加载完成，开始执行脚本');

  // 获取核心DOM元素
  const sky = document.getElementById('sky');
  const modal = document.getElementById('modal');
  const starNumberSpan = document.getElementById('star-number');
  const customMessageEl = document.getElementById('custom-message');
  const puzzleContainer = document.getElementById('puzzle-container');
  const extraPhoto = document.getElementById('extra-photo');
  const photoTip = document.getElementById('photo-tip');
  const exitBtn = document.getElementById('exit-btn');

  // 调试：检查关键元素是否存在
  console.log('sky:', sky);
  console.log('modal:', modal);
  console.log('starNumberSpan:', starNumberSpan);
  console.log('customMessageEl:', customMessageEl);
  console.log('puzzleContainer:', puzzleContainer);
  console.log('extraPhoto:', extraPhoto);
  console.log('photoTip:', photoTip);
  console.log('exitBtn:', exitBtn);

  // 元素不存在则终止执行（容错：exitBtn 可选）
  if (!sky || !modal || !starNumberSpan || !customMessageEl || !puzzleContainer || !extraPhoto) {
    console.error('核心 DOM 元素未找到，请检查 HTML 中的 ID 是否正确');
    return;
  }
  // photoTip 缺失仅警告，不终止
  if (!photoTip) {
    console.warn('提示文字元素 photo-tip 未找到，将隐藏提示文字功能');
  }

  const starData = [
    {
      id: "star_01",
      message: "一点点 走近你",
      image: "/puzzle/puzzle_star_01.jpg",
      photos: [
        "/photo/star_01/01.jpg",
        "/photo/star_01/02.jpg",
        "/photo/star_01/03.jpg",
        "/photo/star_01/04.jpg",
        "/photo/star_01/05.jpg",
        "/photo/star_01/06.jpg",
        "/photo/star_01/07.jpg",
        "/photo/star_01/08.jpg"
      ]
    },
    {
      id: "star_02",
      message: "旅途不觉漫长",
      image: "/puzzle/puzzle_star_02.jpg",
      photos: [
        "/photo/star_02/01.jpg",
        "/photo/star_02/02.jpg",
        "/photo/star_02/03.jpg",
        "/photo/star_02/04.jpg",
        "/photo/star_02/05.jpg",
        "/photo/star_02/06.jpg",
        "/photo/star_02/07.jpg",
        "/photo/star_02/08.jpg",
        "/photo/star_02/09.jpg",
        "/photo/star_02/10.jpg",
        "/photo/star_02/11.jpg",
        "/photo/star_02/12.jpg",
        "/photo/star_02/13.jpg",
        "/photo/star_02/14.jpg"
      ]
    },
    {
      id: "star_03",
      message: "想不出甜甜的话了，这条留给你：)",
      image: "/puzzle/puzzle_star_03.jpg",
      photos: [
        "/photo/star_03/01.jpg",
        "/photo/star_03/02.jpg",
        "/photo/star_03/03.jpg",
        "/photo/star_03/04.jpg",
        "/photo/star_03/05.jpg",
        "/photo/star_03/06.jpg"
      ]
    },
    {
      id: "star_04",
      message: "有时候不在身边陪你",
      image: "/puzzle/puzzle_star_04.jpg",
      photos: [
        "/photo/star_04/01.jpg",
        "/photo/star_04/02.jpg",
        "/photo/star_04/03.jpg",
        "/photo/star_04/04.jpg",
        "/photo/star_04/05.jpg",
        "/photo/star_04/06.jpg",
        "/photo/star_04/07.jpg",
        "/photo/star_04/08.jpg",
        "/photo/star_04/09.jpg",
        "/photo/star_04/10.jpg",
        "/photo/star_04/11.jpg",
        "/photo/star_04/12.jpg"
      ]
    },
    {
      id: "star_05",
      message: "memories we shared",
      image: "/puzzle/puzzle_star_05.jpg",
      photos: [
        "/photo/star_05/01.jpg",
        "/photo/star_05/02.jpg",
        "/photo/star_05/03.jpg",
        "/photo/star_05/04.jpg",
        "/photo/star_05/05.jpg",
        "/photo/star_05/06.jpg",
        "/photo/star_05/07.jpg",
        "/photo/star_05/08.jpg",
        "/photo/star_05/09.jpg",
        "/photo/star_05/10.jpg",
        "/photo/star_05/11.jpg",
        "/photo/star_05/12.jpg",
        "/photo/star_05/13.jpg"
      ]
    },
    {
      id: "star_06",
      message: "有时候我们真的不爱拍照o(TヘTo)",
      image: "/puzzle/puzzle_star_03.jpg",
      photos: [
        "/photo/star_06/01.jpg",
        "/photo/star_06/02.jpg"
      ]
    },
    {
      id: "star_07",
      message: "给你的祝福永远不嫌多",
      image: "/puzzle/puzzle_star_07.jpg",
      photos: [
        "/photo/star_07/01.jpg",
      ]
    },
    {
      id: "star_08",
      message: "我们总在往夜空里看星星",
      image: "/puzzle/puzzle_star_08.jpg",
      photos: [
        "/photo/star_08/01.jpg",
      ]
    },
    {
      id: "star_09",
      message: "好喜欢这个下午，这一天",
      image: "/puzzle/puzzle_star_09.jpg",
      photos: [
        "/photo/star_09/01.jpg",
        "/photo/star_09/02.jpg",
        "/photo/star_09/03.jpg"
      ]
    },
    {
      id: "star_10",
      message: "掺了些我的记忆^-^",
      image: "/puzzle/puzzle_star_09.jpg",
      photos: [
        "/photo/star_10/01.jpg",
        "/photo/star_10/02.jpg",
        "/photo/star_10/03.jpg",
        "/photo/star_10/04.jpg",
        "/photo/star_10/05.jpg",
        "/photo/star_10/06.jpg",
        "/photo/star_10/07.jpg"
      ]
    }
  ];

  // 当前照片索引
  let currentPhotoIndex = 0;
  let currentPhotos = [];
  // 记录当前选中的星星数据
  let currentStarData = null;

  // 拼图完成检测函数（放宽误差到10px）
  function checkPuzzleComplete(puzzlePieces) {
    const container = puzzleContainer;
    const containerRect = container.getBoundingClientRect();
    const pieceSize = 100;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const piece = puzzlePieces[row * 3 + col];
        if (!piece) return false; // 容错：拼图块不存在则返回未完成
        
        const pieceRect = piece.getBoundingClientRect();
        const correctLeft = col * pieceSize;
        const correctTop = row * pieceSize;
        const actualLeft = pieceRect.left - containerRect.left;
        const actualTop = pieceRect.top - containerRect.top;

        if (Math.abs(actualLeft - correctLeft) > 10 || Math.abs(actualTop - correctTop) > 10) {
          return false;
        }
      }
    }
    return true;
  }

  // 显示Bingo和大尺寸照片（新增日志）
  function showBingoAndPhotos(photos) {
    currentPhotos = photos || [];
    currentPhotoIndex = 0;

    // 容错：无照片时提示
    if (currentPhotos.length === 0) {
      alert('Bingo！拼图完成啦 ✨ 暂无照片');
      return;
    }

    // 弹出Bingo提示 + 打印照片总数
    alert(`Bingo！拼图完成啦 ✨ 共${photos.length}张照片，点击照片切换～`);
    
    // 隐藏拼图容器
    puzzleContainer.style.display = 'none';
    
    // 显示大尺寸照片 + 提示文字
    extraPhoto.src = currentPhotos[currentPhotoIndex];
    extraPhoto.classList.remove('hidden');
    if (photoTip) {
      photoTip.classList.remove('hidden');
    }

    // 点击照片切换下一张（新增日志）
    extraPhoto.onclick = () => {
      currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
      extraPhoto.src = currentPhotos[currentPhotoIndex];
      // 打印当前播放的索引和路径
      console.log(`当前播放第${currentPhotoIndex + 1}张，路径：${currentPhotos[currentPhotoIndex]}`);
    };
  }

  // 拼图拖拽核心函数
  function initPuzzleDrag(puzzlePieces) {
    let isDragging = false;
    let currentPiece = null;
    let offsetX = 0;
    let offsetY = 0;

    puzzlePieces.forEach(piece => {
      piece.addEventListener('mousedown', (e) => {
        isDragging = true;
        currentPiece = piece;
        
        const rect = piece.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        piece.style.zIndex = 100;
        e.preventDefault();
      });
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !currentPiece) return;

      const containerRect = puzzleContainer.getBoundingClientRect();
      let newLeft = e.clientX - containerRect.left - offsetX;
      let newTop = e.clientY - containerRect.top - offsetY;
      
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - currentPiece.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, containerRect.height - currentPiece.offsetHeight));
      
      currentPiece.style.left = `${newLeft}px`;
      currentPiece.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', () => {
      if (currentPiece) {
        currentPiece.style.zIndex = 1;

        // 检测拼图完成
        if (checkPuzzleComplete(puzzlePieces) && currentStarData) {
          showBingoAndPhotos(currentStarData.photos);
        }
      }
      isDragging = false;
      currentPiece = null;
    });
  }

  // 创建 19 颗星星
  const totalStars = 19;
  for (let i = 0; i < totalStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    const size = 4 + Math.random() * 12;
    star.style.width = size + 'px';
    star.style.height = size + 'px';

    const dataIndex = i % starData.length;
    const data = starData[dataIndex];

    star.addEventListener('click', () => {
      console.log(`点击了第 ${i + 1} 颗星，使用星星数据：${data.id}`);
      alert(`鸦鸦点击了第 ${i + 1} 颗星哦！`);

      // 重置所有状态
      puzzleContainer.style.display = 'block'; 
      extraPhoto.classList.add('hidden');     
      if (photoTip) photoTip.classList.add('hidden');       
      extraPhoto.src = '';
      currentStarData = data;

      starNumberSpan.textContent = i + 1;
      customMessageEl.textContent = data.message;

      // 清空并重新生成拼图
      puzzleContainer.innerHTML = '';
      const puzzlePieces = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const piece = document.createElement('div');
          piece.className = 'puzzle-piece';
          piece.style.backgroundImage = `url('${data.image}')`;
          piece.style.backgroundSize = '300px 300px';
          piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
          
          // 随机初始位置
          // 初始位置：拼图容器中间 ±50px 范围内随机（方便拖拽）
          const containerWidth = puzzleContainer.clientWidth;
          const containerHeight = puzzleContainer.clientHeight;
          // 中间位置坐标
          const centerX = (containerWidth - 100) / 2;
          const centerY = (containerHeight - 100) / 2;
          // 中间 ±50px 范围内随机偏移
          const randomX = centerX + (Math.random() - 0.5) * 100;
          const randomY = centerY + (Math.random() - 0.5) * 100;
          // 限制在容器内
          const finalX = Math.max(0, Math.min(randomX, containerWidth - 100));
          const finalY = Math.max(0, Math.min(randomY, containerHeight - 100));

          piece.style.left = `${finalX}px`;
          piece.style.top = `${finalY}px`;
          
          puzzleContainer.appendChild(piece);
          puzzlePieces.push(piece);
        }
      }

      // 初始化拖拽
      initPuzzleDrag(puzzlePieces);
      modal.classList.remove('hidden');
      console.log('模态框显示，当前拼图图片路径：', data.image);
    });

    sky.appendChild(star);
  }

  // Exit 按钮逻辑（容错：避免空值报错）
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      // 重置状态
      puzzleContainer.style.display = 'block';
      extraPhoto.classList.add('hidden');
      if (photoTip) photoTip.classList.add('hidden');
      extraPhoto.src = '';
      console.log('点击exit按钮关闭弹窗');
    });
  } else {
    // 兼容：如果exitBtn不存在，恢复点击外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
    console.warn('Exit按钮未找到，已启用点击外部关闭弹窗');
  }
});