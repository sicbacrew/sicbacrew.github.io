// enhance.js - Complete Enhanced Version
document.addEventListener('DOMContentLoaded', function() {
    // Create enhance button container
    const enhanceContainer = document.createElement('div');
    enhanceContainer.className = 'enhance-prompt-container';
    enhanceContainer.innerHTML = `
        <button id="enhancePromptBtn" class="neumorphic-btn btn-secondary">
            <i class="fas fa-wand-magic-sparkles"></i> Enhance Prompt
        </button>
        <span class="enhance-tooltip">Get AI suggestions to improve your prompt (GPT-4 Turbo)</span>
    `;

    // Insert above the generator textarea
    const textareaContainer = document.querySelector('#generatorPrompt').parentNode;
    textareaContainer.insertBefore(enhanceContainer, textareaContainer.firstChild);

    // Enhanced prompt functionality
    document.getElementById('enhancePromptBtn').addEventListener('click', async function() {
        const promptInput = document.getElementById('generatorPrompt');
        const originalPrompt = promptInput.value.trim();
        
        if (!originalPrompt) {
            alert('Please enter a prompt first');
            return;
        }

        const btn = this;
        const originalBtnHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Enhancing...';

        try {
            // Show intermediate state
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const enhancedPrompt = await enhancePromptWithFallback(originalPrompt);
            promptInput.value = enhancedPrompt;
            
            // Visual feedback
            btn.innerHTML = '<i class="fas fa-check"></i> Enhanced!';
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error('Enhancement error:', error);
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            
            // Apply basic enhancement as fallback
            promptInput.value = `${originalPrompt}, ultra HD, 8K resolution, highly detailed, professional photography`;
            await new Promise(resolve => setTimeout(resolve, 1500));
        } finally {
            btn.innerHTML = originalBtnHTML;
            btn.disabled = false;
        }
    });

    async function enhancePromptWithFallback(prompt, retries = 2) {
        try {
            return await enhancePrompt(prompt);
        } catch (error) {
            if (retries > 0) {
                console.log(`Retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return enhancePromptWithFallback(prompt, retries - 1);
            }
            throw error;
        }
    }

    async function enhancePrompt(prompt) {
        const apiUrl = 'https://text.pollinations.ai/openai';
        
        const payload = {
            model: "gpt-4-1106-preview", // Latest GPT-4 Turbo model
            messages: [
                {
                    role: "system",
                    content: `You are a professional prompt engineer. Enhance this image generation prompt by adding:
1. Detailed visual descriptions
2. Artistic style references
3. Technical parameters (resolution, lighting)
4. Relevant artist influences
5. Composition details
                        
Return ONLY the enhanced prompt in the user's original language. Never add explanatory text.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 5000,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.2,
            presence_penalty: 0.2
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error("Invalid API response structure");
        }

        return data.choices[0].message.content
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .trim();
    }

    // Auto-enhance when prompt is pasted
    document.getElementById('generatorPrompt').addEventListener('paste', async function(e) {
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        if (pastedText.length > 10 && pastedText.length < 500) {
            setTimeout(async () => {
                if (confirm('Would you like to enhance the pasted prompt?')) {
                    document.getElementById('enhancePromptBtn').click();
                }
            }, 100);
        }
    });
});