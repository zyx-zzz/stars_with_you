const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 配置上传
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg/jpeg/png/gif/webp image formats are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 数据文件
const photoDataFile = path.join(__dirname, 'photoData.json');
if (!fs.existsSync(photoDataFile)) {
  fs.writeJsonSync(photoDataFile, { stars: [] }, { spaces: 2 });
}

// 上传照片/拼图
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a photo to upload!' });
    }

    const { starId, message, type } = req.body;
    if (!starId) {
      return res.status(400).json({ success: false, message: 'Please select the corresponding star!' });
    }

    const photoUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    const photoData = fs.readJsonSync(photoDataFile);
    
    let starItem = photoData.stars.find(item => item.id === starId);
    if (!starItem) {
      starItem = { id: starId, message: message || '', photos: [], puzzle: '' };
      photoData.stars.push(starItem);
    }

    // 区分拼图和照片
    if (type === 'puzzle') {
      starItem.puzzle = photoUrl;
    } else {
      starItem.photos.push(photoUrl);
    }

    fs.writeJsonSync(photoDataFile, photoData, { spaces: 2 });

    res.json({
      success: true,
      message: type === 'puzzle' ? 'Puzzle uploaded successfully!' : 'Photo uploaded successfully!',
      data: { photoUrl, starId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  }
});

// 获取星星照片
app.get('/api/get-photos/:starId', (req, res) => {
  try {
    const starId = req.params.starId;
    const photoData = fs.readJsonSync(photoDataFile);
    const starItem = photoData.stars.find(item => item.id === starId);
    
    res.json({
      success: true,
      data: starItem || { id: starId, message: '', photos: [], puzzle: '' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get photos: ' + error.message });
  }
});

// 新增：删除照片
app.post('/api/delete-photo', (req, res) => {
  try {
    const { starId, photoUrl } = req.body;
    if (!starId || !photoUrl) {
      return res.status(400).json({ success: false, message: 'Incomplete parameters!' });
    }

    const photoData = fs.readJsonSync(photoDataFile);
    const starItem = photoData.stars.find(item => item.id === starId);
    
    if (starItem) {
      // 从数组中删除
      starItem.photos = starItem.photos.filter(url => url !== photoUrl);
      fs.writeJsonSync(photoDataFile, photoData, { spaces: 2 });
      
      // 删除文件（可选）
      const filename = photoUrl.split('/uploads/')[1];
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Deletion failed: ' + error.message });
  }
});

// ========== 新增：删除星星（含所有照片/拼图文件） ==========
app.delete('/api/delete-star/:starId', (req, res) => {
  try {
    const starId = req.params.starId;
    const photoData = fs.readJsonSync(photoDataFile);
    
    // 1. 找到该星星的所有数据
    const starIndex = photoData.stars.findIndex(item => item.id === starId);
    if (starIndex === -1) {
      return res.json({ success: true, message: 'Star does not exist, no need to delete' });
    }
    const starItem = photoData.stars[starIndex];

    // 2. 删除所有照片文件
    if (starItem.photos && starItem.photos.length > 0) {
      starItem.photos.forEach(photoUrl => {
        if (photoUrl.includes('localhost:3001/uploads')) {
          const filename = photoUrl.split('/uploads/')[1];
          const filePath = path.join(uploadDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // 删除本地文件
          }
        }
      });
    }

    // 3. 删除拼图文件
    if (starItem.puzzle && starItem.puzzle.includes('localhost:3001/uploads')) {
      const filename = starItem.puzzle.split('/uploads/')[1];
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 4. 从JSON数据中删除星星
    photoData.stars.splice(starIndex, 1);
    fs.writeJsonSync(photoDataFile, photoData, { spaces: 2 });

    res.json({
      success: true,
      message: `Star [${starId}] and all its photos/puzzles have been deleted!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete star: ' + error.message });
  }
});

// 静态文件托管
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`Backend server running at: http://localhost:${PORT}`);
  console.log(`Photos will be saved to: ${uploadDir}`);
});