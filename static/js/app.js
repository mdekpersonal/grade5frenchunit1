// Audio management for multiple carousels
const audioPlayers = {};
let currentAudio = null;

function createAudioPlayer(audioId) {
    if (!audioPlayers[audioId]) {
        const audio = new Audio(`/static/audio/${audioId}.wav`);
        audio.addEventListener('error', function() {
            console.log(`Audio file not found: ${audioId}.wav`);
            const sectionNames = {
                'section-0-vocab': 'Leçons Orales - Dialogues',
                'section-1-vocab': 'Conjugaison & Temps',
                'section-2-vocab': 'Grammaire & Structure',
                'section-3-vocab': 'Orthographe & Accords',
                'section-4-vocab': 'Vocabulaire'
            };
            const displayName = sectionNames[audioId] || audioId;
            showAudioMessage(`🎵 Audio placeholder: ${displayName}`, 'info');
        });
        audio.addEventListener('ended', function() {
            showAudioMessage('🎵 Audio terminé!', 'success');
        });
        audio.addEventListener('loadedmetadata', function() {
            console.log(`Audio duration for ${audioId}: ${audio.duration} seconds`);
        });
        audioPlayers[audioId] = audio;
    }
    return audioPlayers[audioId];
}

function getCarouselElement(audioId) {
    // Determine which carousel corresponds to this audio
    const sectionMatch = audioId.match(/section-(\d+)-(\w+)/);
    if (sectionMatch) {
        const sectionNum = parseInt(sectionMatch[1]) + 1; // Convert from 0-based audio ID to 1-based carousel ID
        const carouselType = sectionMatch[2]; // 'vocab' or 'expr'
        
        // For the new structure, we use cardsCarousel
        if (carouselType === 'vocab') {
            return document.getElementById(`cardsCarousel${sectionNum}`);
        } else if (carouselType === 'expr') {
            return document.getElementById(`cardsCarousel${sectionNum}`);
        }
    }
    return null;
}

// Auto-advance functionality removed - manual navigation only

// Auto-advance stopping functionality removed - no longer needed

function playAudio(audioId) {
    try {
        // Stop any currently playing audio
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        const audio = createAudioPlayer(audioId);
        audio.currentTime = 0;
        currentAudio = audio;
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                const displayName = audioId.replace('section-', 'Section ').replace('-vocab', ' Vocabulary').replace('-expr', ' Expressions');
                showAudioMessage(`🎵 Playing ${displayName}!`, 'success');
                console.log(`Audio started successfully: ${audioId}`);
            }).catch(error => {
                console.log('Playback failed:', error);
                const displayName = audioId.replace('section-', 'Section ').replace('-vocab', ' Vocabulary').replace('-expr', ' Expressions');
                showAudioMessage(`🎵 Audio placeholder: ${displayName}`, 'info');
            });
        }
    } catch (error) {
        console.log('Audio error:', error);
        showAudioMessage(`🎵 Audio not available for ${audioId}`, 'info');
    }
}

function pauseAudio(audioId) {
    if (audioPlayers[audioId] && !audioPlayers[audioId].paused) {
        audioPlayers[audioId].pause();
        showAudioMessage('⏸️ Audio paused!', 'warning');
    } else {
        showAudioMessage('⏸️ No audio playing to pause', 'warning');
    }
}

function stopAudio(audioId) {
    if (audioPlayers[audioId]) {
        audioPlayers[audioId].pause();
        audioPlayers[audioId].currentTime = 0;
        
        // Reset carousel to first slide
        const carousel = getCarouselElement(audioId);
        if (carousel) {
            const bootstrapCarousel = bootstrap.Carousel.getInstance(carousel) || new bootstrap.Carousel(carousel);
            bootstrapCarousel.to(0);
        }
        
        showAudioMessage('🛑 Audio stopped!', 'danger');
    } else {
        showAudioMessage('🛑 No audio to stop', 'danger');
    }
}

// Show audio status message
function showAudioMessage(message, type) {
    // Remove existing messages
    const existingToast = document.querySelector('.audio-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast message
    const toast = document.createElement('div');
    toast.className = `audio-toast alert alert-${type} position-fixed`;
    toast.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        border-radius: 15px;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Text-to-Speech functionality
function speakText(text) {
    // Stop any currently playing audio first
    Object.values(audioPlayers).forEach(audio => {
        if (!audio.paused) {
            audio.pause();
        }
    });

    if ('speechSynthesis' in window) {
        // Stop any current speech
        window.speechSynthesis.cancel();

        // Clean text (remove emojis for better TTS)
        const cleanText = text.replace(/[👋🧑‍🦱🤔😊🤷‍♀️🎉👦👧🤝🙋‍♂️🎈❤️🟢🔵🟡💗🟠🖌️🌈👩‍🦰🔵🧒🐒🧍📝⭐🎭]/g, '').trim();
        
        if (cleanText) {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Get available voices
            const voices = window.speechSynthesis.getVoices();
            
            // Try to use French voices
            const preferredVoices = voices.filter(voice => 
                voice.lang.startsWith('fr') ||
                voice.name.toLowerCase().includes('french') ||
                voice.name.toLowerCase().includes('marie') ||
                voice.name.toLowerCase().includes('amelie')
            );
            
            if (preferredVoices.length > 0) {
                utterance.voice = preferredVoices[0];
            }
            
            utterance.rate = 0.8; // Slower for kids
            utterance.pitch = 1.2; // Higher pitch
            utterance.volume = 0.9;
            
            window.speechSynthesis.speak(utterance);
            
            // Show feedback
            showAudioMessage(`🗣️ Lecture: "${cleanText.substring(0, 30)}..."`, 'info');
        }
    } else {
        showAudioMessage('🗣️ Speech not supported in this browser', 'warning');
    }
}

// Repeat text function for better learning
function repeatText(text) {
    // Clean text (remove emojis for better TTS)
    const cleanText = text.replace(/[✏️🧼🔪📏🎒🖊️👝✂️📓💻📚❓🗣️🎨⭐😁⚽1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣1️⃣1️⃣1️⃣2️⃣📝🤝]/g, '').trim();
    
    if ('speechSynthesis' in window && cleanText) {
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        let repeatCount = 0;
        const maxRepeats = 3;
        
        function speakRepeat() {
            if (repeatCount < maxRepeats) {
                const utterance = new SpeechSynthesisUtterance(cleanText);
                
                // Get available voices
                const voices = window.speechSynthesis.getVoices();
                
                // Try to use French voices
                const preferredVoices = voices.filter(voice => 
                    voice.lang.startsWith('fr') ||
                    voice.name.toLowerCase().includes('french') ||
                    voice.name.toLowerCase().includes('marie') ||
                    voice.name.toLowerCase().includes('amelie')
                );
                
                if (preferredVoices.length > 0) {
                    utterance.voice = preferredVoices[0];
                }
                
                utterance.rate = 0.7; // Even slower for repetition
                utterance.pitch = 1.3; // Slightly higher pitch
                utterance.volume = 0.9;
                
                utterance.onend = () => {
                    repeatCount++;
                    if (repeatCount < maxRepeats) {
                        setTimeout(speakRepeat, 800); // Short pause between repeats
                    } else {
                        showAudioMessage(`🎯 Répétition terminée: "${cleanText.substring(0, 30)}..."`, 'success');
                    }
                };
                
                window.speechSynthesis.speak(utterance);
                
                if (repeatCount === 0) {
                    showAudioMessage(`🔁 Répétition: "${cleanText.substring(0, 30)}..." (${maxRepeats} fois)`, 'info');
                }
            }
        }
        
        speakRepeat();
    } else {
        showAudioMessage('🗣️ Speech not supported in this browser', 'warning');
    }
}

// Auto-sync debugging functionality removed - manual navigation only

// Function to get detailed carousel info for all sections
function getAllCarouselInfo() {
    console.log('📊 ALL CAROUSEL INFO:');
    for (let section = 1; section <= 3; section++) {
        console.log(`\n📋 Section ${section}:`);
        
        // Check vocabulary carousel
        const vocabCarousel = document.getElementById(`vocabularyCarousel${section}`);
        if (vocabCarousel) {
            const vocabItems = vocabCarousel.querySelectorAll('.carousel-item');
            console.log(`   📖 Vocabulary: ${vocabItems.length} items (section-${section}-vocab.wav)`);
        }
        
        // Check expressions carousel
        const exprCarousel = document.getElementById(`expressionsCarousel${section}`);
        if (exprCarousel) {
            const exprItems = exprCarousel.querySelectorAll('.carousel-item');
            console.log(`   💬 Expressions: ${exprItems.length} items (section-${section}-expr.wav)`);
        }
    }
    
    console.log('\n🎵 To test sync: Play any carousel and use checkSync() during playback');
}

// Make debug functions available globally
window.getAllCarouselInfo = getAllCarouselInfo;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        // Space bar to pause/play
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            const activeCarousel = document.querySelector('.carousel-item.active');
            if (activeCarousel && audioManager.currentAudio) {
                if (audioManager.isPlaying) {
                    audioManager.pause();
                } else {
                    audioManager.play();
                }
            }
        }
        
        // Arrow keys for carousel navigation
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            const activeCarousel = document.querySelector('.carousel-item.active');
            if (activeCarousel) {
                const carousel = activeCarousel.closest('.carousel');
                const direction = e.code === 'ArrowLeft' ? 'prev' : 'next';
                const button = carousel.querySelector(`.carousel-control-${direction}`);
                if (button) {
                    button.click();
                }
            }
        }
    });

    // Add fun hover effects to cards
    const cards = document.querySelectorAll('.carousel-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .carousel-item.active {
            animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0.5; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Welcome message
    setTimeout(() => {
        audioManager.showAudioMessage('🌟 Welcome to English Fun Time! Click any button to explore! 🎉', 'success');
    }, 1000);

    console.log('🎉 English Learning App initialized successfully!');
});