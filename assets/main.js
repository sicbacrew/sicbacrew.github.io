document.addEventListener('DOMContentLoaded', function() {
    // Fungsi untuk menghasilkan seed acak
    function generateRandomSeed() {
        return Math.floor(Math.random() * 1000000000).toString();
    }

    // Toggle pengaturan lanjutan
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedContent = document.getElementById('advancedContent');
    const advancedIcon = advancedToggle.querySelector('.fa-chevron-down');
    
    advancedToggle.addEventListener('click', function() {
        advancedContent.classList.toggle('show');
        advancedIcon.classList.toggle('fa-chevron-down');
        advancedIcon.classList.toggle('fa-chevron-up');
    });
    
    // Fungsi analisis gambar
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzerResult = document.getElementById('analyzerResult');
    const analyzerPrompt = document.getElementById('analyzerPrompt');
    const fileInputLabel = document.querySelector('.file-input-label');
    const actionButtons = document.getElementById('actionButtons');
    const usePromptBtn = document.getElementById('usePromptBtn');
    
    // Fungsi generator gambar
    const generatorPrompt = document.getElementById('generatorPrompt');
    const generateBtn = document.getElementById('generateBtn');
    const generatorResult = document.getElementById('generatorResult');
    const generatedImage = document.getElementById('generatedImage');
    const clearPromptBtn = document.getElementById('clearPromptBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const useForAnalysisBtn = document.getElementById('useForAnalysisBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const historyList = document.getElementById('historyList');
    const imageSizeSelect = document.getElementById('imageSize');
    
    // Pengaturan lanjutan
    const negativePrompt = document.getElementById('negativePrompt');
    const seedInput = document.getElementById('seedInput');
    
    // Kontrol slider
    const creativitySlider = document.getElementById('creativitySlider');
    const creativityValue = document.getElementById('creativityValue');
    const detailSlider = document.getElementById('detailSlider');
    const detailValue = document.getElementById('detailValue');
    const styleSlider = document.getElementById('styleSlider');
    const styleValue = document.getElementById('styleValue');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    
    // Inisialisasi slider
    creativitySlider.addEventListener('input', function() {
        creativityValue.textContent = `${this.value}%`;
    });
    
    detailSlider.addEventListener('input', function() {
        detailValue.textContent = `${this.value}%`;
    });
    
    styleSlider.addEventListener('input', function() {
        styleValue.textContent = `${this.value}%`;
    });
    
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = `${this.value}%`;
    });
    
    // Style presets
    document.querySelectorAll('.style-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            document.querySelectorAll('.style-preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            const currentPrompt = generatorPrompt.value;
            if (!currentPrompt.includes(this.dataset.style)) {
                generatorPrompt.value = `${currentPrompt}, ${this.dataset.style} style`.trim();
            }
        });
    });
    
    // Quality presets
    document.querySelectorAll('.quality-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            document.querySelectorAll('.quality-preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            qualitySlider.value = this.dataset.quality;
            qualityValue.textContent = `${this.dataset.quality}%`;
        });
    });
    
    // Tombol tambahan
    document.getElementById('addLightingBtn').addEventListener('click', function() {
        const lightingOptions = ['soft lighting', 'dramatic lighting', 'cinematic lighting', 'neon lighting', 'natural lighting'];
        const selected = lightingOptions[Math.floor(Math.random() * lightingOptions.length)];
        generatorPrompt.value = `${generatorPrompt.value}, ${selected}`.trim();
    });
    
    document.getElementById('addColorBtn').addEventListener('click', function() {
        const colorOptions = ['vibrant colors', 'pastel colors', 'monochrome', 'warm tones', 'cool tones'];
        const selected = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        generatorPrompt.value = `${generatorPrompt.value}, ${selected}`.trim();
    });
    
    document.getElementById('addCompositionBtn').addEventListener('click', function() {
        const compositionOptions = ['rule of thirds', 'symmetrical composition', 'close-up', 'wide angle', 'overhead view'];
        const selected = compositionOptions[Math.floor(Math.random() * compositionOptions.length)];
        generatorPrompt.value = `${generatorPrompt.value}, ${selected}`.trim();
    });
    
    // Pratinjau unggahan gambar
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                analyzeBtn.disabled = false;
                fileInputLabel.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Tombol analisis gambar
    analyzeBtn.addEventListener('click', async function() {
        const file = imageUpload.files[0];
        if (!file) return;
        
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="loading"></span> Memproses...';
        analyzerResult.innerHTML = 'Menganalisis gambar...';
        actionButtons.style.display = 'none';
        
        try {
            const base64Image = await toBase64(file);
            const userPrompt = analyzerPrompt.value.trim() || "Jelaskan gambar ini secara detail";
            const description = await analyzeImage(base64Image, userPrompt);
            
            analyzerResult.innerHTML = `<strong>Hasil Analisis:</strong><br><br>${description}`;
            actionButtons.style.display = 'flex';
            
            analyzerResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            console.error('Error:', error);
            analyzerResult.innerHTML = `<strong>Error:</strong> Gagal menganalisis gambar. Silakan coba lagi.`;
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analisis Gambar';
        }
    });
    
    // Tombol gunakan prompt
    usePromptBtn.addEventListener('click', function() {
        const description = analyzerResult.textContent.replace('Hasil Analisis:', '').trim();
        if (description) {
            generatorPrompt.value = description;
            document.getElementById('generatorToggle').scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Tombol hapus prompt
    clearPromptBtn.addEventListener('click', function() {
        generatorPrompt.value = '';
        negativePrompt.value = '';
        seedInput.value = '';
    });
    
    // Tombol generate gambar
    generateBtn.addEventListener('click', async function() {
        const prompt = generatorPrompt.value.trim();
        if (!prompt) {
            alert('Silakan masukkan prompt');
            return;
        }
        
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="loading"></span> Menghasilkan...';
        generatorResult.innerHTML = '<p>Sedang menghasilkan gambar...</p>';
        generatedImage.style.display = 'none';
        document.getElementById('imageActions').style.display = 'none';
        
        try {
            const selectedSize = imageSizeSelect.value;
            const [width, height] = selectedSize.split('x');
            
            const params = new URLSearchParams();
            params.append('width', width);
            params.append('height', height);
            params.append('nologo', 'true');
            params.append('safe', 'false');
            params.append('quality', qualitySlider.value);
            
            if (negativePrompt.value.trim()) {
                params.append('negative', negativePrompt.value.trim());
            }
            
            // Selalu gunakan seed acak baru setiap kali generate
            const randomSeed = generateRandomSeed();
            params.append('seed', randomSeed);
            seedInput.value = randomSeed; // Update input field dengan seed baru
            
            // Tambahkan parameter slider
            params.append('creativity', (creativitySlider.value / 100).toFixed(2));
            params.append('detail', (detailSlider.value / 100).toFixed(2));
            params.append('style_consistency', (styleSlider.value / 100).toFixed(2));
            
            // Tambahkan gaya artistik jika dipilih
            const activeStyle = document.querySelector('.style-preset.active');
            if (activeStyle) {
                params.append('style', activeStyle.dataset.style);
            }
            
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
            
            const img = new Image();
            img.onload = function() {
                generatedImage.src = imageUrl;
                generatedImage.style.display = 'block';
                generatorResult.innerHTML = '';
                generatorResult.appendChild(generatedImage);
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Hasilkan Gambar';
                document.getElementById('imageActions').style.display = 'flex';
                
                document.getElementById('generatorResult').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                addToHistory(prompt, imageUrl, selectedSize);
            };
            img.onerror = function() {
                generatorResult.innerHTML = '<p>Gagal menghasilkan gambar. Silakan coba dengan prompt berbeda.</p>';
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Hasilkan Gambar';
            };
            img.src = imageUrl;
            
        } catch (error) {
            console.error('Error:', error);
            generatorResult.innerHTML = '<p>Gagal menghasilkan gambar. Silakan coba lagi dengan prompt berbeda.</p>';
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Hasilkan Gambar';
        }
    });
    
    // Tombol unduh
    downloadBtn.addEventListener('click', function() {
        if (generatedImage.src && !generatedImage.src.includes('data:')) {
            const link = document.createElement('a');
            link.href = generatedImage.src;
            link.download = `ai-gambar-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
    
    // Tombol analisis gambar hasil
    useForAnalysisBtn.addEventListener('click', function() {
        if (generatedImage.src) {
            fetch(generatedImage.src)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "gambar-hasil.jpg", { type: "image/jpeg" });
                    const dataUrl = URL.createObjectURL(file);
                    
                    imagePreview.src = dataUrl;
                    imagePreview.style.display = 'block';
                    analyzeBtn.disabled = false;
                    fileInputLabel.style.display = 'none';
                    
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    imageUpload.files = dataTransfer.files;
                    
                    document.getElementById('analyzerToggle').scrollIntoView({ behavior: 'smooth' });
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Gagal memuat gambar untuk analisis');
                });
        }
    });
    
    // Tombol hapus riwayat
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua riwayat generasi?')) {
            historyList.innerHTML = '<p>Belum ada riwayat generasi.</p>';
            localStorage.removeItem('generationHistory');
        }
    });
    
    // Fungsi tambahkan ke riwayat
    function addToHistory(prompt, imageUrl, size) {
        let history = JSON.parse(localStorage.getItem('generationHistory')) || [];
        history.unshift({
            prompt: prompt,
            imageUrl: imageUrl,
            size: size,
            quality: qualitySlider.value,
            timestamp: new Date().toISOString()
        });
        
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('generationHistory', JSON.stringify(history));
        renderHistory();
    }
    
    // Fungsi render riwayat
    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('generationHistory')) || [];
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<p>Belum ada riwayat generasi.</p>';
            return;
        }
        
        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.index = index;
            
            historyItem.innerHTML = `
                <div class="history-prompt">${item.prompt.substring(0, 100)}${item.prompt.length > 100 ? '...' : ''}</div>
                <div>Ukuran: ${item.size} • Kualitas: ${item.quality}% • ${new Date(item.timestamp).toLocaleString()}</div>
                <img src="${item.imageUrl}" class="history-image" data-fullurl="${item.imageUrl}">
                <div class="action-buttons" style="margin-top: 10px;">
                    <button class="neumorphic-btn btn-secondary use-history-btn" style="flex: 1;">
                        <i class="fas fa-magic"></i> Hasilkan Ulang
                    </button>
                    <button class="neumorphic-btn btn-secondary use-history-prompt-btn" style="flex: 1;">
                        <i class="fas fa-search"></i> Analisis
                    </button>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        document.querySelectorAll('.use-history-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = btn.closest('.history-item').dataset.index;
                const history = JSON.parse(localStorage.getItem('generationHistory')) || [];
                const item = history[index];
                
                if (item) {
                    generatorPrompt.value = item.prompt;
                    imageSizeSelect.value = item.size;
                    qualitySlider.value = item.quality;
                    qualityValue.textContent = `${item.quality}%`;
                    document.getElementById('generatorToggle').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        document.querySelectorAll('.use-history-prompt-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const imgUrl = btn.closest('.history-item').querySelector('.history-image').dataset.fullurl;
                
                fetch(imgUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "gambar-riwayat.jpg", { type: "image/jpeg" });
                        const dataUrl = URL.createObjectURL(file);
                        
                        imagePreview.src = dataUrl;
                        imagePreview.style.display = 'block';
                        analyzeBtn.disabled = false;
                        fileInputLabel.style.display = 'none';
                        
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        imageUpload.files = dataTransfer.files;
                        
                        document.getElementById('analyzerToggle').scrollIntoView({ behavior: 'smooth' });
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Gagal memuat gambar untuk analisis');
                    });
            });
        });
        
        document.querySelectorAll('.history-image').forEach(img => {
            img.addEventListener('click', function() {
                const fullUrl = this.dataset.fullurl;
                window.open(fullUrl, '_blank');
            });
        });
    }
    
    // Muat riwayat saat halaman dimuat
    renderHistory();
    
    // Fungsi konversi file ke base64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
    
    // Fungsi analisis gambar menggunakan API
    async function analyzeImage(base64Image, prompt) {
        const apiUrl = 'https://text.pollinations.ai/openai';
        
        const payload = {
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Gagal meminta API dengan status ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
});