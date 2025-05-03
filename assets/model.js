// model.js
document.addEventListener('DOMContentLoaded', function() {
    // Model configuration
    const availableModels = {
        flux: {
            name: "Flux (Default)",
            params: {
                model: "flux",
                nologo: "true",
                safe: "false"
            },
            supportsNegativePrompt: true,
            supportsSeed: true,
            qualityRange: [50, 100]
        },
        turbo: {
            name: "Turbo",
            params: {
                model: "turbo",
                nologo: "true",
                safe: "false"
            },
            supportsNegativePrompt: true,
            supportsSeed: true,
            qualityRange: [70, 100]
        }
    };

    // Add model selector to the UI
    function addModelSelector() {
        const advancedContent = document.getElementById('advancedContent');
        if (!advancedContent) return;

        const modelSelectorHTML = `
            <label>Model AI:</label>
            <select id="modelSelect" class="neumorphic-select" style="margin-bottom: 16px;">
                <option value="flux" selected>${availableModels.flux.name}</option>
                <option value="turbo">${availableModels.turbo.name}</option>
            </select>
        `;

        // Insert at the beginning of advanced content
        advancedContent.insertAdjacentHTML('afterbegin', modelSelectorHTML);

        // Add event listener for model change
        const modelSelect = document.getElementById('modelSelect');
        modelSelect.addEventListener('change', function() {
            updateUIForModel(this.value);
        });

        // Initialize UI for default model
        updateUIForModel('flux');
    }

    // Update UI based on selected model
    function updateUIForModel(modelKey) {
        const model = availableModels[modelKey];
        if (!model) return;

        // Update quality slider range
        const qualitySlider = document.getElementById('qualitySlider');
        qualitySlider.min = model.qualityRange[0];
        qualitySlider.max = model.qualityRange[1];
        
        // Adjust quality value if needed
        if (qualitySlider.value < model.qualityRange[0]) {
            qualitySlider.value = model.qualityRange[0];
            document.getElementById('qualityValue').textContent = `${model.qualityRange[0]}%`;
        }

        // Update quality presets
        updateQualityPresets(model.qualityRange);
    }

    // Update quality presets based on model's quality range
    function updateQualityPresets(range) {
        const qualityPresets = document.querySelector('.quality-presets');
        if (!qualityPresets) return;

        // Clear existing presets
        qualityPresets.innerHTML = '';

        // Add presets based on range
        const [min, max] = range;
        const step = Math.floor((max - min) / 3);
        
        const presets = [
            { value: min, label: "Cepat" },
            { value: min + step, label: "Standar" },
            { value: min + (step * 2), label: "Premium" },
            { value: max, label: "Maksimal" }
        ];

        presets.forEach((preset, index) => {
            const isActive = index === 1; // Default to "Standar"
            const presetElement = document.createElement('div');
            presetElement.className = `quality-preset ${isActive ? 'active' : ''}`;
            presetElement.dataset.quality = preset.value;
            presetElement.textContent = preset.label;
            
            presetElement.addEventListener('click', function() {
                document.querySelectorAll('.quality-preset').forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                qualitySlider.value = this.dataset.quality;
                document.getElementById('qualityValue').textContent = `${this.dataset.quality}%`;
            });
            
            qualityPresets.appendChild(presetElement);
        });

        // Update slider if needed
        const qualitySlider = document.getElementById('qualitySlider');
        if (qualitySlider.value < min) {
            qualitySlider.value = min + step; // Default to "Standar"
            document.getElementById('qualityValue').textContent = `${min + step}%`;
        }
    }

    // Modify the generate function to use selected model
    function modifyGenerateFunction() {
        const generateBtn = document.getElementById('generateBtn');
        const generatorPrompt = document.getElementById('generatorPrompt');
        const generatorResult = document.getElementById('generatorResult');
        const generatedImage = document.getElementById('generatedImage');
        const imageSizeSelect = document.getElementById('imageSize');
        const qualitySlider = document.getElementById('qualitySlider');
        const negativePrompt = document.getElementById('negativePrompt');
        const seedInput = document.getElementById('seedInput');
        const creativitySlider = document.getElementById('creativitySlider');
        const detailSlider = document.getElementById('detailSlider');
        const styleSlider = document.getElementById('styleSlider');

        if (!generateBtn) return;

        generateBtn.addEventListener('click', async function() {
            const prompt = generatorPrompt.value.trim();
            if (!prompt) {
                alert('Silakan masukkan prompt');
                return;
            }

            const modelSelect = document.getElementById('modelSelect');
            const selectedModel = modelSelect ? modelSelect.value : 'flux';
            const model = availableModels[selectedModel];

            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="loading"></span> Menghasilkan...';
            generatorResult.innerHTML = '<p>Sedang menghasilkan gambar...</p>';
            generatedImage.style.display = 'none';
            document.getElementById('imageActions').style.display = 'none';

            try {
                const selectedSize = imageSizeSelect.value;
                const [width, height] = selectedSize.split('x');
                
                const params = new URLSearchParams(model.params);
                params.append('width', width);
                params.append('height', height);
                params.append('quality', qualitySlider.value);
                
                // Add negative prompt if provided
                if (negativePrompt.value.trim()) {
                    params.append('negative', negativePrompt.value.trim());
                }
                
                // Add seed if provided
                if (seedInput.value.trim()) {
                    params.append('seed', seedInput.value.trim());
                }
                
                // Add slider parameters
                params.append('creativity', (creativitySlider.value / 100).toFixed(2));
                params.append('detail', (detailSlider.value / 100).toFixed(2));
                params.append('style_consistency', (styleSlider.value / 100).toFixed(2));
                
                // Add artistic style if selected
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
                    
                    addToHistory(prompt, imageUrl, selectedSize, selectedModel);
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
    }

    // Modify addToHistory to include model information
    function addToHistory(prompt, imageUrl, size, model) {
        let history = JSON.parse(localStorage.getItem('generationHistory')) || [];
        history.unshift({
            prompt: prompt,
            imageUrl: imageUrl,
            size: size,
            model: model,
            quality: document.getElementById('qualitySlider').value,
            timestamp: new Date().toISOString()
        });
        
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('generationHistory', JSON.stringify(history));
        renderHistory();
    }

    // Initialize the model functionality
    addModelSelector();
    modifyGenerateFunction();
});