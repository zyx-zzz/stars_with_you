document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 加载完成，开始执行脚本');

  // ========== 核心DOM元素获取 ==========
  // 原有元素
  const sky = document.getElementById('sky');
  const modal = document.getElementById('modal');
  const starNumberSpan = document.getElementById('star-number');
  const customMessageEl = document.getElementById('custom-message');
  const puzzleContainer = document.getElementById('puzzle-container');
  const extraPhoto = document.getElementById('extra-photo');
  const photoTip = document.getElementById('photo-tip');
  const exitBtn = document.getElementById('exit-btn');

  // 新增管理面板元素
  const manageStarsBtn = document.getElementById('manage-stars-btn');
  const starsManageModal = document.getElementById('stars-manage-modal');
  const stepSelectStar = document.getElementById('step-select-star');
  const stepManageActions = document.getElementById('step-manage-actions');
  const starSelector = document.getElementById('star-selector');
  const newStarIdInput = document.getElementById('new-star-id');
  const newStarMessageInput = document.getElementById('new-star-message');
  const createStarBtn = document.getElementById('create-star-btn');
  const confirmStarBtn = document.getElementById('confirm-star-btn');
  const currentManageStarSpan = document.getElementById('current-manage-star');
  const uploadPuzzleFile = document.getElementById('upload-puzzle-file');
  const uploadPuzzleBtn = document.getElementById('upload-puzzle-btn');
  const uploadPhotoFile = document.getElementById('upload-photo-file');
  const uploadPhotoManageBtn = document.getElementById('upload-photo-manage-btn');
  const deletePuzzleBtn = document.getElementById('delete-puzzle-btn');
  const photoList = document.getElementById('photo-list');
  const backToSelectBtn = document.getElementById('back-to-select-btn');
  const closeManageBtn = document.getElementById('close-manage-btn');
  const deleteStarBtn = document.getElementById('delete-star-btn'); // 新增
  // ========== 调试 & 容错 ==========
  console.log('核心元素检查：', {
    sky, modal, starNumberSpan, customMessageEl, puzzleContainer, extraPhoto,
    manageStarsBtn, starsManageModal
  });

  if (!sky || !modal || !starNumberSpan || !customMessageEl || !puzzleContainer || !extraPhoto) {
    console.error('核心 DOM 元素未找到，请检查 HTML 中的 ID 是否正确');
    return;
  }
  if (!photoTip) console.warn('提示文字元素 photo-tip 未找到，将隐藏提示文字功能');

  // ========== 数据存储 ==========
  // 原始星星数据
  const baseStarData = [
    { id: "star_01", message: "Getting a little closer to you", image: "/puzzle/puzzle_star_01.jpg", photos: ["/photo/star_01/01.jpg", "/photo/star_01/02.jpg", "/photo/star_01/03.jpg", "/photo/star_01/04.jpg", "/photo/star_01/05.jpg", "/photo/star_01/06.jpg", "/photo/star_01/07.jpg", "/photo/star_01/08.jpg"] },
    { id: "star_02", message: "The journey never feels long.", image: "/puzzle/puzzle_star_02.jpg", photos: ["/photo/star_02/01.jpg", "/photo/star_02/02.jpg", "/photo/star_02/03.jpg", "/photo/star_02/04.jpg", "/photo/star_02/05.jpg", "/photo/star_02/06.jpg", "/photo/star_02/07.jpg", "/photo/star_02/08.jpg", "/photo/star_02/09.jpg", "/photo/star_02/10.jpg", "/photo/star_02/11.jpg", "/photo/star_02/12.jpg", "/photo/star_02/13.jpg", "/photo/star_02/14.jpg"] },
    { id: "star_03", message: "Can't think of sweet words, this one's for you:)", image: "/puzzle/puzzle_star_03.jpg", photos: ["/photo/star_03/01.jpg", "/photo/star_03/02.jpg", "/photo/star_03/03.jpg", "/photo/star_03/04.jpg", "/photo/star_03/05.jpg", "/photo/star_03/06.jpg"] },
    { id: "star_04", message: "Sometimes I'm not with you", image: "/puzzle/puzzle_star_04.jpg", photos: ["/photo/star_04/01.jpg", "/photo/star_04/02.jpg", "/photo/star_04/03.jpg", "/photo/star_04/04.jpg", "/photo/star_04/05.jpg", "/photo/star_04/06.jpg", "/photo/star_04/07.jpg", "/photo/star_04/08.jpg", "/photo/star_04/09.jpg", "/photo/star_04/10.jpg", "/photo/star_04/11.jpg", "/photo/star_04/12.jpg"] },
    { id: "star_05", message: "memories we shared", image: "/puzzle/puzzle_star_05.jpg", photos: ["/photo/star_05/01.jpg", "/photo/star_05/02.jpg", "/photo/star_05/03.jpg", "/photo/star_05/04.jpg", "/photo/star_05/05.jpg", "/photo/star_05/06.jpg", "/photo/star_05/07.jpg", "/photo/star_05/08.jpg", "/photo/star_05/09.jpg", "/photo/star_05/10.jpg", "/photo/star_05/11.jpg", "/photo/star_05/12.jpg", "/photo/star_05/13.jpg"] },
    { id: "star_06", message: "Sometimes we really don't like taking photos o(TヘTo)", image: "/puzzle/puzzle_star_03.jpg", photos: ["/photo/star_06/01.jpg", "/photo/star_06/02.jpg"] },
    { id: "star_07", message: "Blessings for you are never enough", image: "/puzzle/puzzle_star_07.jpg", photos: ["/photo/star_07/01.jpg"] },
    { id: "star_08", message: "We always look at the stars in the night sky", image: "/puzzle/puzzle_star_08.jpg", photos: ["/photo/star_08/01.jpg"] },
    { id: "star_09", message: "I do love this afternoon, this day", image: "/puzzle/puzzle_star_09.jpg", photos: ["/photo/star_09/01.jpg", "/photo/star_09/02.jpg", "/photo/star_09/03.jpg"] },
    { id: "star_10", message: "Mixed with some of my memories^-^", image: "/puzzle/puzzle_star_09.jpg", photos: ["/photo/star_10/01.jpg", "/photo/star_10/02.jpg", "/photo/star_10/03.jpg", "/photo/star_10/04.jpg", "/photo/star_10/05.jpg", "/photo/star_10/06.jpg", "/photo/star_10/07.jpg"] }
  ];

  // 运行时星星数据（合并原始数据 + 自定义数据）
  let starData = JSON.parse(JSON.stringify(baseStarData));
  // 自定义拼图背景存储（key: starId, value: puzzleUrl）
  let customPuzzleMap = {};
  // 当前选中的管理星星ID
  let currentManageStarId = '';
  // 原有交互变量
  let currentPhotoIndex = 0;
  let currentPhotos = [];
  let currentStarData = null;

  // ========== 原有核心功能 ==========
  // 拼图完成检测
  function checkPuzzleComplete(puzzlePieces) {
    const container = puzzleContainer;
    const containerRect = container.getBoundingClientRect();
    const pieceSize = 100;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const piece = puzzlePieces[row * 3 + col];
        if (!piece) return false;
        
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

  // 加载并显示照片（合并本地+后端数据）
  async function loadAndShowPhotos(starId) {
    try {
      // 从后端获取上传的照片
      const res = await fetch(`http://localhost:3001/api/get-photos/${starId}`);
      const data = await res.json();
      
      // 合并原始照片 + 上传的照片
      const basePhotos = starData.find(s => s.id === starId)?.photos || [];
      const uploadedPhotos = data.success ? (data.data.photos || []) : [];
      currentPhotos = [...basePhotos, ...uploadedPhotos];
      currentPhotoIndex = 0;

      if (currentPhotos.length === 0) {
        alert('Bingo! Puzzle completed ✨ No photos available～');
        return;
      }

      alert(`Bingo! Puzzle completed ✨ Total ${currentPhotos.length} photos, click to switch～`);
      
      puzzleContainer.style.display = 'none';
      extraPhoto.src = currentPhotos[currentPhotoIndex];
      extraPhoto.classList.remove('hidden');
      if (photoTip) photoTip.classList.remove('hidden');

      extraPhoto.onclick = () => {
        currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
        extraPhoto.src = currentPhotos[currentPhotoIndex];
        console.log(`当前播放第${currentPhotoIndex + 1}张：${currentPhotos[currentPhotoIndex]}`);
      };
    } catch (error) {
      console.error('获取照片失败：', error);
      alert('Failed to get photos! Please check if the backend server is running!');
    }
  }

  // 拼图拖拽
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
        if (checkPuzzleComplete(puzzlePieces) && currentStarData) {
          loadAndShowPhotos(currentStarData.id);
        }
      }
      isDragging = false;
      currentPiece = null;
    });
  }

  // 创建星星（原有逻辑）
  function createStars() {
    const totalStars = 19;
    sky.innerHTML = ''; // 清空原有星星
    const lawn = document.createElement('div');
    lawn.id = 'lawn';
    sky.appendChild(lawn);
    
    const characters = document.createElement('div');
    characters.id = 'characters';
    characters.innerHTML = `
      <div class="boy">
        <div class="head"></div>
        <div class="body"></div>
        <div class="arm left"></div>
        <div class="arm right"></div>
        <div class="leg left"></div>
        <div class="leg right"></div>
      </div>
      <div class="girl">
        <div class="head">
          <div class="top"></div>
        </div>
        <div class="body"></div>
        <div class="arm left"></div>
        <div class="arm right"></div>
        <div class="leg left"></div>
        <div class="leg right"></div>
      </div>
    `;
    sky.appendChild(characters);

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
        alert(`Yaya clicked the ${i + 1}th star!`);

        puzzleContainer.style.display = 'block'; 
        extraPhoto.classList.add('hidden');     
        if (photoTip) photoTip.classList.add('hidden');       
        extraPhoto.src = '';
        currentStarData = data;

        starNumberSpan.textContent = i + 1;
        customMessageEl.textContent = data.message;

        // 清空并重新生成拼图（优先使用自定义拼图）
        puzzleContainer.innerHTML = '';
        const puzzlePieces = [];
        const puzzleImage = customPuzzleMap[data.id] || data.image;
        
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url('${puzzleImage}')`;
            piece.style.backgroundSize = '300px 300px';
            piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
            
            const containerWidth = puzzleContainer.clientWidth;
            const containerHeight = puzzleContainer.clientHeight;
            const finalX = Math.random() * (containerWidth - 100);
            const finalY = Math.random() * (containerHeight - 100);

            piece.style.left = `${finalX}px`;
            piece.style.top = `${finalY}px`;
            piece.style.zIndex = Math.floor(Math.random() * 9) + 1;
            puzzleContainer.appendChild(piece);
            puzzlePieces.push(piece);
          }
        }

        initPuzzleDrag(puzzlePieces);
        modal.classList.remove('hidden');
      });

      sky.appendChild(star);
    }
  }

  // ========== 新增：星星管理功能 ==========
  // 初始化星星选择器
  function initStarSelector() {
    starSelector.innerHTML = '';
    starData.forEach(star => {
      const option = document.createElement('div');
      option.className = 'star-option';
      option.dataset.starId = star.id;
      option.textContent = `${star.id} - ${star.message}`;
      option.addEventListener('click', () => {
        // 清除其他选中状态
        document.querySelectorAll('.star-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        currentManageStarId = star.id;
      });
      starSelector.appendChild(option);
    });
    // 默认选中第一个
    if (starData.length > 0) {
      document.querySelector('.star-option').classList.add('active');
      currentManageStarId = starData[0].id;
    }
  }

  // 加载星星照片列表
  async function loadPhotoList(starId) {
    photoList.innerHTML = 'Loading...';
    try {
      // 获取后端照片
      const res = await fetch(`http://localhost:3001/api/get-photos/${starId}`);
      const data = await res.json();
      const uploadedPhotos = data.success ? (data.data.photos || []) : [];
      // 获取本地照片
      const basePhotos = starData.find(s => s.id === starId)?.photos || [];
      const allPhotos = [...basePhotos, ...uploadedPhotos];

      if (allPhotos.length === 0) {
        photoList.innerHTML = '<div style="text-align:center; color:#999;">No photos available</div>';
        return;
      }

      photoList.innerHTML = '';
      allPhotos.forEach((photoUrl, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
          <img src="${photoUrl}" class="photo-thumb" alt="photo-${index}">
          <span>Photo ${index + 1}</span>
          <button class="delete-photo-btn" data-url="${photoUrl}">Delete</button>
        `;
        // 删除照片事件
        photoItem.querySelector('.delete-photo-btn').addEventListener('click', async (e) => {
          const url = e.target.dataset.url;
          if (confirm('Are you sure you want to delete this photo?')) {
            // 删除后端上传的照片
            if (url.includes('localhost:3001/uploads')) {
              try {
                await fetch(`http://localhost:3001/api/delete-photo`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ starId, photoUrl: url })
                });
              } catch (error) {
                console.error('删除照片失败：', error);
                alert('Deletion failed! Please check the backend!');
              }
            }
            // 重新加载列表
            loadPhotoList(starId);
          }
        });
        photoList.appendChild(photoItem);
      });
    } catch (error) {
      console.error('加载照片列表失败：', error);
      photoList.innerHTML = '<div style="text-align:center; color:#ff6b6b;">Load failed</div>';
    }
  }

  // 上传拼图背景
  async function uploadPuzzleBackground() {
    const file = uploadPuzzleFile.files[0];
    if (!file || !currentManageStarId) {
      alert('Please select a puzzle image and a star!');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('starId', currentManageStarId);
    formData.append('type', 'puzzle');

    try {
      const res = await fetch('http://localhost:3001/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        // 保存自定义拼图映射
        customPuzzleMap[currentManageStarId] = data.data.photoUrl;
        alert('Puzzle background set successfully!');
        uploadPuzzleFile.value = '';
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('上传拼图失败：', error);
      alert('Upload failed! Please check the backend!');
    }
  }

  // 上传照片（管理面板）
  async function uploadPhotoInManage() {
    const file = uploadPhotoFile.files[0];
    if (!file || !currentManageStarId) {
      alert('Please select a photo and a star!');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('starId', currentManageStarId);
    formData.append('type', 'photo');

    try {
      const res = await fetch('http://localhost:3001/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Photo uploaded successfully!');
        uploadPhotoFile.value = '';
        loadPhotoList(currentManageStarId); // 刷新列表
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('上传照片失败：', error);
      alert('Upload failed! Please check the backend!');
    }
  }

  // ========== 新增：删除星星 ==========
function deleteCurrentStar() {
  if (!currentManageStarId) {
    alert('Please select a star first!');
    return;
  }
  if (!confirm(`Are you sure you want to permanently delete the star [${currentManageStarId}]?\nCannot be recovered after deletion!`)) {
    return;
  }

  // 1. 从 starData 里删掉
  starData = starData.filter(s => s.id !== currentManageStarId);

  // 2. 删掉自定义拼图
  delete customPuzzleMap[currentManageStarId];

  // 3. 刷新界面星星 + 选择器
  createStars();
  initStarSelector();

  // 4. 退回选择页面
  stepManageActions.classList.add('hidden');
  stepSelectStar.classList.remove('hidden');

  alert(`Star [${currentManageStarId}] has been deleted`);
}

  // 删除自定义拼图
function deleteCustomPuzzle() {
  if (!currentManageStarId) {
    alert('Please select a star!');
    return;
  }
  if (confirm(`Are you sure you want to delete the custom puzzle for ${currentManageStarId}?`)) {
    delete customPuzzleMap[currentManageStarId];
    alert('Custom puzzle deleted, restored to default!');
  }
}

// ========== 新增：删除星星（含后端数据） ==========
async function deleteCurrentStar() {
  if (!currentManageStarId) {
    alert('Please select the star to delete first!');
    return;
  }

  // 双层确认（防止误删）
  const confirm1 = confirm(`⚠️ Dangerous operation!\nAre you sure you want to delete the star [${currentManageStarId}]?`);
  if (!confirm1) return;
  
  const deletePassword = '11110228'; // 这里可以修改成你想要的密码
  const inputPwd = prompt(`Please enter the deletion password to confirm:`);
  
  // 密码验证逻辑
  if (!inputPwd) { // 用户点取消
    alert('Deletion operation cancelled!');
    return;
  } else if (inputPwd !== deletePassword) { // 密码错误
    alert('Incorrect password! Deletion operation cancelled.');
    return;
  }

  try {
    // 1. 调用后端接口删除星星的所有数据（照片+拼图）
    await fetch(`http://localhost:3001/api/delete-star/${currentManageStarId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    // 2. 前端本地删除
    starData = starData.filter(s => s.id !== currentManageStarId); // 从星星列表删除
    delete customPuzzleMap[currentManageStarId]; // 删除自定义拼图

    // 3. 刷新界面
    createStars(); // 重新生成星空星星
    initStarSelector(); // 重新初始化选择器
    stepManageActions.classList.add('hidden'); // 退回选择页
    stepSelectStar.classList.remove('hidden');

    alert(`✅ Star [${currentManageStarId}] has been permanently deleted (including all photos/puzzles)!`);
  } catch (error) {
    console.error('删除星星失败：', error);
    alert('Deletion failed! Please check if the backend server is running.');
  }
}


  // 创建新星星
  function createNewStar() {
    const starId = newStarIdInput.value.trim();
    const message = newStarMessageInput.value.trim();
    
    if (!starId || !message) {
      alert('Please fill in the star ID and description!');
      return;
    }
    if (starData.some(s => s.id === starId)) {
      alert('This star ID already exists!');
      return;
    }

    // 添加新星星
    starData.push({
      id: starId,
      message: message,
      image: "/puzzle/puzzle_star_01.jpg", // 默认拼图
      photos: []
    });
    // 重新初始化选择器和星星
    initStarSelector();
    createStars();
    // 清空输入框
    newStarIdInput.value = '';
    newStarMessageInput.value = '';
    alert(`Star ${starId} created successfully!`);
  }

  // ========== 事件绑定 ==========
  // 原有退出按钮
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      puzzleContainer.style.display = 'block';
      extraPhoto.classList.add('hidden');
      if (photoTip) photoTip.classList.add('hidden');
      extraPhoto.src = '';
    });
  } else {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // 管理面板事件
  // 打开管理面板
  manageStarsBtn.addEventListener('click', () => {
    starsManageModal.classList.remove('hidden');
    initStarSelector();
  });

  // 关闭管理面板
  closeManageBtn.addEventListener('click', () => {
    starsManageModal.classList.add('hidden');
  });

  // 创建新星星
  createStarBtn.addEventListener('click', createNewStar);

  // 确认选择星星
  confirmStarBtn.addEventListener('click', () => {
    if (!currentManageStarId) {
      alert('Please select a star!');
      return;
    }
    // 切换到操作面板
    stepSelectStar.classList.add('hidden');
    stepManageActions.classList.remove('hidden');
    currentManageStarSpan.textContent = currentManageStarId;
    // 加载照片列表
    loadPhotoList(currentManageStarId);
  });

  // 返回选择星星
  backToSelectBtn.addEventListener('click', () => {
    stepManageActions.classList.add('hidden');
    stepSelectStar.classList.remove('hidden');
  });

  // 上传拼图背景
  uploadPuzzleBtn.addEventListener('click', uploadPuzzleBackground);

  // 上传照片
  uploadPhotoManageBtn.addEventListener('click', uploadPhotoInManage);

  // 删除自定义拼图
  deletePuzzleBtn.addEventListener('click', deleteCustomPuzzle);

  // ========== 新增：绑定删除星星按钮 ==========
  deleteStarBtn.addEventListener('click', deleteCurrentStar);

  // ========== 初始化 ==========
  createStars();
});
