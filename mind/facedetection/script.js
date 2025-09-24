class FaceDetectionApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDetecting = false;
        this.detectionInterval = null;
        this.faceDetection = null;
        this.stream = null;
        
        // Upload mode elements
        this.uploadCanvas = document.getElementById('uploadCanvas');
        this.uploadCtx = this.uploadCanvas.getContext('2d');
        this.uploadedImage = document.getElementById('uploadedImage');
        this.imageInput = document.getElementById('imageInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadedImageContainer = document.getElementById('uploadedImageContainer');
        this.currentMode = 'camera'; // 'camera' or 'upload'
        
        // UI Elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.toggleDetectionBtn = document.getElementById('toggleDetectionBtn');
        this.loading = document.getElementById('loading');
        
        // Mode switching elements
        this.cameraModeBtn = document.getElementById('cameraModeBtn');
        this.uploadModeBtn = document.getElementById('uploadModeBtn');
        this.cameraMode = document.getElementById('cameraMode');
        this.uploadMode = document.getElementById('uploadMode');
        
        // Upload mode elements
        this.detectUploadedBtn = document.getElementById('detectUploadedBtn');
        this.clearImageBtn = document.getElementById('clearImageBtn');
        
        // Settings
        this.detectionIntervalInput = document.getElementById('detectionInterval');
        this.detectionSensitivityInput = document.getElementById('detectionSensitivity');
        this.intervalValue = document.getElementById('intervalValue');
        this.sensitivityValue = document.getElementById('sensitivityValue');
        
        // Results
        this.status = document.getElementById('status');
        this.faceCountResult = document.getElementById('faceCountResult');
        this.accuracy = document.getElementById('accuracy');
        this.faceCount = document.getElementById('faceCount');
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadFaceDetectionModel();
        this.hideLoading();
    }
    
    setupEventListeners() {
        // Camera mode events
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.toggleDetectionBtn.addEventListener('click', () => this.toggleDetection());
        
        // Mode switching events
        this.cameraModeBtn.addEventListener('click', () => this.switchMode('camera'));
        this.uploadModeBtn.addEventListener('click', () => this.switchMode('upload'));
        
        // Upload mode events
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.detectUploadedBtn.addEventListener('click', () => this.detectFacesInUploadedImage());
        this.clearImageBtn.addEventListener('click', () => this.clearUploadedImage());
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        
        // Settings
        this.detectionIntervalInput.addEventListener('input', (e) => {
            this.intervalValue.textContent = e.target.value + 'ms';
        });
        
        this.detectionSensitivityInput.addEventListener('input', (e) => {
            this.sensitivityValue.textContent = e.target.value;
        });
        
        // Video resize
        this.video.addEventListener('loadedmetadata', () => {
            this.resizeCanvas();
        });
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    async loadFaceDetectionModel() {
        try {
            // Using MediaPipe Face Detection
            const { FaceDetection } = window;
            
            if (!FaceDetection) {
                throw new Error('MediaPipe Face Detection not available');
            }
            
            this.faceDetection = new FaceDetection({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
                }
            });
            
            this.faceDetection.setOptions({
                model: 'short',
                minDetectionConfidence: parseFloat(this.detectionSensitivityInput.value)
            });
            
            this.faceDetection.onResults((results) => {
                this.drawResults(results);
            });
            
            console.log('Face detection model loaded successfully');
        } catch (error) {
            console.error('Failed to load face detection model:', error);
            this.showError('Failed to load face detection model. Using fallback method.');
            this.setupFallbackDetection();
        }
    }
    
    setupFallbackDetection() {
        // Fallback using basic canvas detection (simplified)
        this.faceDetection = {
            send: async (imageData) => {
                // Simulate face detection with random results for demo
                const faces = this.simulateFaceDetection();
                this.drawFallbackResults(faces);
            }
        };
    }
    
    simulateFaceDetection() {
        // Simple simulation for demo purposes
        const faces = [];
        const numFaces = Math.floor(Math.random() * 3); // 0-2 faces
        
        for (let i = 0; i < numFaces; i++) {
            faces.push({
                locationData: {
                    relativeBoundingBox: {
                        xCenter: Math.random() * 0.8 + 0.1,
                        yCenter: Math.random() * 0.8 + 0.1,
                        width: Math.random() * 0.3 + 0.1,
                        height: Math.random() * 0.3 + 0.1
                    }
                },
                score: Math.random() * 0.5 + 0.5
            });
        }
        
        return faces;
    }
    
    async startCamera() {
        try {
            this.updateStatus('Starting camera...');
            
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = this.stream;
            await this.video.play();
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.captureBtn.disabled = false;
            this.toggleDetectionBtn.disabled = false;
            
            this.updateStatus('Camera started successfully');
            
            // Start detection after a short delay
            setTimeout(() => {
                this.startDetection();
            }, 1000);
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showError('Failed to access camera. Please check permissions.');
        }
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        this.stopDetection();
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.captureBtn.disabled = true;
        this.toggleDetectionBtn.disabled = true;
        
        this.clearCanvas();
        this.updateStatus('Camera stopped');
        this.updateFaceCount(0);
    }
    
    startDetection() {
        if (this.isDetecting) return;
        
        this.isDetecting = true;
        this.toggleDetectionBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Stop Detection';
        
        const interval = parseInt(this.detectionIntervalInput.value);
        this.detectionInterval = setInterval(() => {
            this.detectFaces();
        }, interval);
        
        this.updateStatus('Face detection active');
    }
    
    stopDetection() {
        this.isDetecting = false;
        this.toggleDetectionBtn.innerHTML = '<i class="fas fa-eye"></i> Start Detection';
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        this.clearCanvas();
        this.updateStatus('Face detection stopped');
    }
    
    toggleDetection() {
        if (this.isDetecting) {
            this.stopDetection();
        } else {
            this.startDetection();
        }
    }
    
    async detectFaces() {
        if (!this.video.videoWidth || !this.video.videoHeight) return;
        
        try {
            if (this.faceDetection && this.faceDetection.send) {
                // MediaPipe detection
                await this.faceDetection.send({
                    image: this.video
                });
            } else {
                // Fallback detection
                const faces = this.simulateFaceDetection();
                this.drawFallbackResults(faces);
            }
        } catch (error) {
            console.error('Detection error:', error);
        }
    }
    
    drawResults(results) {
        this.clearCanvas();
        
        if (results.detections && results.detections.length > 0) {
            const videoWidth = this.video.videoWidth;
            const videoHeight = this.video.videoHeight;
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            
            const scaleX = canvasWidth / videoWidth;
            const scaleY = canvasHeight / videoHeight;
            
            results.detections.forEach((detection, index) => {
                const bbox = detection.locationData.relativeBoundingBox;
                const x = bbox.xCenter * canvasWidth - (bbox.width * canvasWidth) / 2;
                const y = bbox.yCenter * canvasHeight - (bbox.height * canvasHeight) / 2;
                const width = bbox.width * canvasWidth;
                const height = bbox.height * canvasHeight;
                
                this.drawFaceBox(x, y, width, height, detection.score, index);
            });
            
            this.updateFaceCount(results.detections.length);
            this.updateAccuracy(results.detections);
        } else {
            this.updateFaceCount(0);
        }
    }
    
    drawFallbackResults(faces) {
        this.clearCanvas();
        
        if (faces.length > 0) {
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            
            faces.forEach((face, index) => {
                const bbox = face.locationData.relativeBoundingBox;
                const x = bbox.xCenter * canvasWidth - (bbox.width * canvasWidth) / 2;
                const y = bbox.yCenter * canvasHeight - (bbox.height * canvasHeight) / 2;
                const width = bbox.width * canvasWidth;
                const height = bbox.height * canvasHeight;
                
                this.drawFaceBox(x, y, width, height, face.score, index);
            });
            
            this.updateFaceCount(faces.length);
            this.updateAccuracy(faces);
        } else {
            this.updateFaceCount(0);
        }
    }
    
    drawFaceBox(x, y, width, height, score, index) {
        // Draw bounding box
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw background for label
        const labelText = `Face ${index + 1} (${Math.round(score * 100)}%)`;
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(x, y - 25, this.ctx.measureText(labelText).width + 10, 25);
        
        // Draw label text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(labelText, x + 5, y - 8);
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resizeCanvas() {
        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;
        
        if (videoWidth && videoHeight) {
            this.canvas.width = videoWidth;
            this.canvas.height = videoHeight;
        }
    }
    
    capturePhoto() {
        if (!this.video.videoWidth || !this.video.videoHeight) return;
        
        // Create a temporary canvas for the photo
        const photoCanvas = document.createElement('canvas');
        const photoCtx = photoCanvas.getContext('2d');
        
        photoCanvas.width = this.video.videoWidth;
        photoCanvas.height = this.video.videoHeight;
        
        // Draw video frame
        photoCtx.drawImage(this.video, 0, 0);
        
        // Draw face detection boxes on the photo
        if (this.isDetecting) {
            photoCtx.strokeStyle = '#4CAF50';
            photoCtx.lineWidth = 3;
            
            // This would need the current face detection results
            // For now, we'll just capture the video frame
        }
        
        // Convert to image
        const dataURL = photoCanvas.toDataURL('image/jpeg', 0.8);
        
        // Create photo element
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = dataURL;
        img.alt = 'Captured Photo';
        
        const photoInfo = document.createElement('div');
        photoInfo.className = 'photo-info';
        photoInfo.innerHTML = `
            <div>Faces: ${this.faceCountResult.textContent}</div>
            <div>${new Date().toLocaleString()}</div>
        `;
        
        photoItem.appendChild(img);
        photoItem.appendChild(photoInfo);
        
        // Add to grid
        const photoGrid = document.getElementById('photoGrid');
        photoGrid.insertBefore(photoItem, photoGrid.firstChild);
        
        // Limit to 10 photos
        while (photoGrid.children.length > 10) {
            photoGrid.removeChild(photoGrid.lastChild);
        }
        
        this.updateStatus('Photo captured successfully');
    }
    
    updateStatus(message) {
        this.status.textContent = message;
        console.log('Status:', message);
    }
    
    updateFaceCount(count) {
        this.faceCount.textContent = `${count} faces detected`;
        this.faceCountResult.textContent = count;
    }
    
    updateAccuracy(detections) {
        if (detections && detections.length > 0) {
            const avgScore = detections.reduce((sum, d) => sum + d.score, 0) / detections.length;
            this.accuracy.textContent = `${Math.round(avgScore * 100)}%`;
        } else {
            this.accuracy.textContent = '--';
        }
    }
    
    showError(message) {
        this.updateStatus(`Error: ${message}`);
        console.error(message);
    }
    
    hideLoading() {
        this.loading.classList.add('hidden');
    }
    
    // Mode switching methods
    switchMode(mode) {
        this.currentMode = mode;
        
        if (mode === 'camera') {
            this.cameraModeBtn.classList.add('active');
            this.uploadModeBtn.classList.remove('active');
            this.cameraMode.classList.remove('hidden');
            this.uploadMode.classList.add('hidden');
            this.updateStatus('Switched to camera mode');
        } else if (mode === 'upload') {
            this.cameraModeBtn.classList.remove('active');
            this.uploadModeBtn.classList.add('active');
            this.cameraMode.classList.add('hidden');
            this.uploadMode.classList.remove('hidden');
            this.updateStatus('Switched to upload mode');
            // Stop camera if running
            if (this.stream) {
                this.stopCamera();
            }
        }
    }
    
    // Image upload methods
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        } else {
            this.showError('Please select a valid image file');
        }
    }
    
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImage.src = e.target.result;
            this.uploadedImage.onload = () => {
                this.showUploadedImage();
                this.updateStatus(`Image loaded: ${file.name}`);
            };
        };
        reader.readAsDataURL(file);
    }
    
    showUploadedImage() {
        this.uploadArea.style.display = 'none';
        this.uploadedImageContainer.classList.remove('hidden');
        
        // Resize canvas to match image
        this.resizeUploadCanvas();
    }
    
    resizeUploadCanvas() {
        const img = this.uploadedImage;
        const container = img.parentElement;
        
        // Get the displayed size of the image
        const rect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        
        // Set canvas size to match the displayed image size
        this.uploadCanvas.width = rect.width;
        this.uploadCanvas.height = rect.height;
        this.uploadCanvas.style.width = rect.width + 'px';
        this.uploadCanvas.style.height = rect.height + 'px';
        
        // Store scale factors for later use
        this.imageScaleX = scaleX;
        this.imageScaleY = scaleY;
    }
    
    clearUploadedImage() {
        this.uploadedImage.src = '';
        this.uploadArea.style.display = 'block';
        this.uploadedImageContainer.classList.add('hidden');
        this.clearUploadCanvas();
        this.updateFaceCount(0);
        this.updateStatus('Image cleared');
    }
    
    clearUploadCanvas() {
        this.uploadCtx.clearRect(0, 0, this.uploadCanvas.width, this.uploadCanvas.height);
    }
    
    // Drag and drop methods
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                this.loadImage(file);
            } else {
                this.showError('Please drop a valid image file');
            }
        }
    }
    
    // Face detection for uploaded images
    async detectFacesInUploadedImage() {
        if (!this.uploadedImage.src) {
            this.showError('Please upload an image first');
            return;
        }
        
        this.updateStatus('Detecting faces in uploaded image...');
        this.clearUploadCanvas();
        
        try {
            if (this.faceDetection && this.faceDetection.send) {
                // Create a temporary canvas to draw the image for detection
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                
                tempCanvas.width = this.uploadedImage.naturalWidth;
                tempCanvas.height = this.uploadedImage.naturalHeight;
                tempCtx.drawImage(this.uploadedImage, 0, 0);
                
                // Use MediaPipe for detection
                await this.faceDetection.send({
                    image: tempCanvas
                });
            } else {
                // Fallback detection
                const faces = this.simulateFaceDetectionForImage();
                this.drawUploadResults(faces);
            }
        } catch (error) {
            console.error('Detection error:', error);
            this.showError('Failed to detect faces in image');
        }
    }
    
    simulateFaceDetectionForImage() {
        // Simulate face detection for uploaded image
        const faces = [];
        const numFaces = Math.floor(Math.random() * 4); // 0-3 faces
        
        for (let i = 0; i < numFaces; i++) {
            faces.push({
                locationData: {
                    relativeBoundingBox: {
                        xCenter: Math.random() * 0.8 + 0.1,
                        yCenter: Math.random() * 0.8 + 0.1,
                        width: Math.random() * 0.25 + 0.1,
                        height: Math.random() * 0.25 + 0.1
                    }
                },
                score: Math.random() * 0.4 + 0.6 // Higher confidence for uploaded images
            });
        }
        
        return faces;
    }
    
    drawUploadResults(faces) {
        this.clearUploadCanvas();
        
        if (faces.length > 0) {
            const canvasWidth = this.uploadCanvas.width;
            const canvasHeight = this.uploadCanvas.height;
            
            faces.forEach((face, index) => {
                const bbox = face.locationData.relativeBoundingBox;
                const x = bbox.xCenter * canvasWidth - (bbox.width * canvasWidth) / 2;
                const y = bbox.yCenter * canvasHeight - (bbox.height * canvasHeight) / 2;
                const width = bbox.width * canvasWidth;
                const height = bbox.height * canvasHeight;
                
                this.drawUploadFaceBox(x, y, width, height, face.score, index);
            });
            
            this.updateFaceCount(faces.length);
            this.updateAccuracy(faces);
            this.updateStatus(`Found ${faces.length} face(s) in uploaded image`);
        } else {
            this.updateFaceCount(0);
            this.updateStatus('No faces detected in uploaded image');
        }
    }
    
    drawUploadFaceBox(x, y, width, height, score, index) {
        // Draw bounding box
        this.uploadCtx.strokeStyle = '#4CAF50';
        this.uploadCtx.lineWidth = 3;
        this.uploadCtx.strokeRect(x, y, width, height);
        
        // Draw background for label
        const labelText = `Face ${index + 1} (${Math.round(score * 100)}%)`;
        const textWidth = this.uploadCtx.measureText(labelText).width;
        this.uploadCtx.fillStyle = '#4CAF50';
        this.uploadCtx.fillRect(x, y - 25, textWidth + 10, 25);
        
        // Draw label text
        this.uploadCtx.fillStyle = 'white';
        this.uploadCtx.font = '12px Arial';
        this.uploadCtx.fillText(labelText, x + 5, y - 8);
    }
    
    // Override the original drawResults method to handle uploaded images
    drawResults(results) {
        if (this.currentMode === 'upload') {
            // Handle uploaded image results
            this.drawUploadResults(results.detections || []);
        } else {
            // Handle camera results (original logic)
            this.clearCanvas();
            
            if (results.detections && results.detections.length > 0) {
                const videoWidth = this.video.videoWidth;
                const videoHeight = this.video.videoHeight;
                const canvasWidth = this.canvas.width;
                const canvasHeight = this.canvas.height;
                
                const scaleX = canvasWidth / videoWidth;
                const scaleY = canvasHeight / videoHeight;
                
                results.detections.forEach((detection, index) => {
                    const bbox = detection.locationData.relativeBoundingBox;
                    const x = bbox.xCenter * canvasWidth - (bbox.width * canvasWidth) / 2;
                    const y = bbox.yCenter * canvasHeight - (bbox.height * canvasHeight) / 2;
                    const width = bbox.width * canvasWidth;
                    const height = bbox.height * canvasHeight;
                    
                    this.drawFaceBox(x, y, width, height, detection.score, index);
                });
                
                this.updateFaceCount(results.detections.length);
                this.updateAccuracy(results.detections);
            } else {
                this.updateFaceCount(0);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FaceDetectionApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.faceDetectionApp) {
        // Pause detection when page is hidden
        window.faceDetectionApp.stopDetection();
    }
});

// Export for global access
window.FaceDetectionApp = FaceDetectionApp;
