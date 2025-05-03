// terjemahan.js
document.addEventListener('DOMContentLoaded', function() {
    // Buat toggle terjemahan
    const translationToggle = document.createElement('div');
    translationToggle.className = 'tool-container';
    translationToggle.innerHTML = `
        <div class="toggle-header" id="translationToggle">
            <h2><i class="fas fa-language"></i> Penerjemah AI</h2>
            <i class="fas fa-chevron-down toggle-icon"></i>
        </div>
        <div class="toggle-content" id="translationContent">
            <div class="neumorphic-card">
                <div class="action-buttons" style="margin-bottom: 10px;">
                    <button id="idToEnBtn" class="neumorphic-btn" style="flex: 1;">
                        ID → EN
                    </button>
                    <button id="enToIdBtn" class="neumorphic-btn" style="flex: 1;">
                        EN → ID
                    </button>
                </div>
                
                <label for="translationInput">Teks untuk diterjemahkan:</label>
                <textarea id="translationInput" class="neumorphic-textarea" 
                          placeholder="Masukkan teks..."></textarea>
                
                <button id="translateBtn" class="neumorphic-btn" style="background: black; color: white;">
                    <i class="fas fa-exchange-alt"></i> Terjemahkan
                </button>
            </div>
            
            <div class="neumorphic-card">
                <h3>Hasil Terjemahan</h3>
                <div id="translationResult" class="result-display">
                    Hasil terjemahan akan muncul di sini...
                </div>
                <div class="action-buttons" id="translationActions" style="display: none; margin-top: 15px;">
                    <button id="useForGenerationBtn" class="neumorphic-btn btn-secondary">
                        <i class="fas fa-magic"></i> Gunakan untuk Generasi
                    </button>
                </div>
            </div>
        </div>
    `;

    // Sisipkan toggle terjemahan setelah generator
    const generatorContainer = document.querySelector('.tool-container');
    generatorContainer.parentNode.insertBefore(translationToggle, generatorContainer.nextSibling);

    // Inisialisasi toggle
    setupToggle('translationToggle', 'translationContent');

    // Variabel UI
    const idToEnBtn = document.getElementById('idToEnBtn');
    const enToIdBtn = document.getElementById('enToIdBtn');
    const translateBtn = document.getElementById('translateBtn');
    const translationInput = document.getElementById('translationInput');
    const translationResult = document.getElementById('translationResult');
    const translationActions = document.getElementById('translationActions');
    const useForGenerationBtn = document.getElementById('useForGenerationBtn');
    
    // Mode terjemahan (default: ID->EN)
    let translationMode = 'id-en';
    
    // Atur mode terjemahan
    idToEnBtn.addEventListener('click', function() {
        translationMode = 'id-en';
        idToEnBtn.classList.add('btn-primary');
        idToEnBtn.classList.remove('btn-secondary');
        enToIdBtn.classList.add('btn-secondary');
        enToIdBtn.classList.remove('btn-primary');
    });
    
    enToIdBtn.addEventListener('click', function() {
        translationMode = 'en-id';
        enToIdBtn.classList.add('btn-primary');
        enToIdBtn.classList.remove('btn-secondary');
        idToEnBtn.classList.add('btn-secondary');
        idToEnBtn.classList.remove('btn-primary');
    });
    
    // Set default mode
    idToEnBtn.click();

    // Fungsi terjemahan
    translateBtn.addEventListener('click', async function() {
        const text = translationInput.value.trim();
        if (!text) {
            alert('Masukkan teks untuk diterjemahkan');
            return;
        }
        
        translateBtn.disabled = true;
        translateBtn.innerHTML = '<span class="loading"></span> Menerjemahkan...';
        translationResult.textContent = 'Sedang menerjemahkan...';
        translationActions.style.display = 'none';
        
        try {
            let prompt;
            if (translationMode === 'id-en') {
                prompt = `Terjemahkan teks berikut dari Bahasa Indonesia ke Bahasa Inggris dengan gaya natural:\n\n"${text}"\n\nTerjemahan:`;
            } else {
                prompt = `Translate the following text from English to Indonesian in natural style:\n\n"${text}"\n\nTranslation:`;
            }
            
            const translatedText = await callTranslationAPI(prompt);
            translationResult.innerHTML = `<strong>Hasil Terjemahan:</strong><br><br>${translatedText}`;
            translationActions.style.display = 'flex';
            
            // Auto-scroll ke hasil
            translationResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            console.error('Translation error:', error);
            translationResult.innerHTML = `<strong>Error:</strong> Gagal menerjemahkan. Silakan coba lagi.`;
        } finally {
            translateBtn.disabled = false;
            translateBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Terjemahkan';
        }
    });
    
    // Tombol Gunakan untuk Generasi
    useForGenerationBtn.addEventListener('click', function() {
        const translatedText = translationResult.textContent
            .replace('Hasil Terjemahan:', '')
            .replace(/<br>/g, '')
            .trim();
            
        if (translatedText) {
            const generatorPrompt = document.getElementById('generatorPrompt');
            generatorPrompt.value = translatedText;
            
            // Scroll ke generator section
            document.getElementById('generatorToggle').scrollIntoView({ behavior: 'smooth' });
            
            // Buka section generator jika collapsed
            const generatorContent = document.getElementById('generatorContent');
            if (generatorContent.classList.contains('collapsed')) {
                document.getElementById('generatorToggle').click();
            }
        }
    });
    
    // Fungsi panggil API terjemahan
    async function callTranslationAPI(prompt) {
        const apiUrl = 'https://text.pollinations.ai/openai';
        
        const payload = {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: prompt
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
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // Reuse existing toggle function
    function setupToggle(toggleId, contentId) {
        const toggle = document.getElementById(toggleId);
        const content = document.getElementById(contentId);
        const icon = toggle.querySelector('.toggle-icon');
        
        let isCollapsed = true;
        
        toggle.addEventListener('click', function() {
            isCollapsed = !isCollapsed;
            content.classList.toggle('collapsed');
            icon.classList.toggle('collapsed');
            
            if (isCollapsed) {
                toggle.style.borderBottomLeftRadius = 'var(--border-radius)';
                toggle.style.borderBottomRightRadius = 'var(--border-radius)';
            } else {
                toggle.style.borderBottomLeftRadius = '0';
                toggle.style.borderBottomRightRadius = '0';
            }
        });
    }
});