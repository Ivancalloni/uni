// Variabili globali ottimizzate
let currentCardIndex = 0;
let cards = [];
let touchStartX = 0;
let touchStartY = 0;
let initialCardX = 0;
let isDragging = false;
let swipeThreshold = 100; // Soglia di swipe per considerarla un'azione completa
let isAnimating = false; // Flag per prevenire azioni multiple durante le animazioni

// Funzione di inizializzazione delle card ottimizzata
function initCards() {
    cards = Array.from(document.querySelectorAll('.card'));
    const totalCards = cards.length;
    
    if (!cards || totalCards === 0) return;
    
    // Container per le card
    const cardStack = document.querySelector('.card-stack');
    
    cards.forEach((card, index) => {
        // Imposta lo z-index
        card.style.zIndex = totalCards - index;
        
        // Imposta lo stile iniziale
        if (index === 0) {
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0) rotate(0deg)';
        } else {
            card.style.opacity = index < 3 ? (0.85 - (index * 0.15)).toString() : '0';
            card.style.transform = `scale(${0.95 - (index * 0.05)}) translateY(${index * 8}px) rotate(0deg)`;
        }
        
        // Aggiungi event listener per il drag
        card.addEventListener('mousedown', startDrag);
        card.addEventListener('touchstart', handleTouchStart, { passive: false });
        
        // Aggiungi event listener per il click (per visualizzare i dettagli)
        card.addEventListener('click', function(e) {
            // Se stiamo trascinando, non aprire il popup
            if (isDragging) return;
            
            // Verifica se il click è stato un tap breve (non un drag)
            if (Math.abs(e.clientX - touchStartX) < 10 && Math.abs(e.clientY - touchStartY) < 10) {
                viewProject();
            }
        });
    });
    
    // Aggiungi event listener globali per il mouse
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}

// Funzioni per gestire il drag con mouse
function startDrag(e) {
    if (currentCardIndex >= cards.length || isAnimating) return;
    
    isDragging = true;
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    initialCardX = 0;
    
    // Aggiungi una classe per indicare che stiamo trascinando
    cards[currentCardIndex].classList.add('dragging');
    
    // Previeni il comportamento predefinito
    e.preventDefault();
}

function moveDrag(e) {
    if (!isDragging || currentCardIndex >= cards.length) return;
    
    const deltaX = e.clientX - touchStartX;
    const deltaY = Math.min(Math.max(e.clientY - touchStartY, -50), 50); // Limita il movimento verticale
    const rotation = deltaX * 0.1; // Rotazione proporzionale allo spostamento
    
    // Applica la trasformazione
    cards[currentCardIndex].style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
    
    // Cambia opacità dello sfondo in base alla direzione
    if (deltaX > 50) {
        // Swipe a destra - like
        cards[currentCardIndex].style.boxShadow = '0 0 15px 3px rgba(0, 255, 0, 0.3)';
    } else if (deltaX < -50) {
        // Swipe a sinistra - reject
        cards[currentCardIndex].style.boxShadow = '0 0 15px 3px rgba(255, 0, 0, 0.3)';
    } else {
        cards[currentCardIndex].style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
    }
}

function endDrag(e) {
    if (!isDragging || currentCardIndex >= cards.length) return;
    
    // Rimuovi la classe dragging
    cards[currentCardIndex].classList.remove('dragging');
    
    // Calcola lo spostamento
    const clientX = e.type === 'mouseup' ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : touchStartX);
    const deltaX = clientX - touchStartX;
    
    // Esegui l'azione in base alla direzione dello swipe
    if (deltaX > swipeThreshold) {
        // Swipe a destra - like (passa al prossimo)
        likeCard();
    } else if (deltaX < -swipeThreshold) {
        // Swipe a sinistra - reject (torna al precedente)
        rejectCard();
    } else {
        // Ritorna alla posizione originale
        resetCardPosition();
    }
    
    isDragging = false;
}

// Funzioni per gestire il touch
function handleTouchStart(e) {
    if (currentCardIndex >= cards.length || isAnimating) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    initialCardX = 0;
    isDragging = true;
    
    // Aggiungi una classe per indicare che stiamo trascinando
    cards[currentCardIndex].classList.add('dragging');
    
    // Non preveniamo il comportamento predefinito qui per permettere lo scroll
}

function handleTouchMove(e) {
    if (!isDragging || currentCardIndex >= cards.length) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = Math.min(Math.max(touchY - touchStartY, -50), 50); // Limita il movimento verticale
    
    // Se lo spostamento orizzontale è significativo, previeni lo scroll
    if (Math.abs(deltaX) > 10) {
        e.preventDefault();
    }
    
    const rotation = deltaX * 0.1; // Rotazione proporzionale allo spostamento
    
    // Applica la trasformazione
    cards[currentCardIndex].style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
    
    // Cambia opacità dello sfondo in base alla direzione
    if (deltaX > 50) {
        // Swipe a destra - like
        cards[currentCardIndex].style.boxShadow = '0 0 15px 3px rgba(0, 255, 0, 0.3)';
    } else if (deltaX < -50) {
        // Swipe a sinistra - reject
        cards[currentCardIndex].style.boxShadow = '0 0 15px 3px rgba(255, 0, 0, 0.3)';
    } else {
        cards[currentCardIndex].style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
    }
}

function handleTouchEnd(e) {
    if (!isDragging || currentCardIndex >= cards.length) return;
    
    // Rimuovi la classe dragging
    cards[currentCardIndex].classList.remove('dragging');
    
    // Verifica se è stato fatto uno swipe finale
    if (e.changedTouches && e.changedTouches.length > 0) {
        const lastTouch = e.changedTouches[0];
        const deltaX = lastTouch.clientX - touchStartX;
        
        // Esegui l'azione in base alla direzione dello swipe
        if (deltaX > swipeThreshold) {
            // Swipe a destra - like (passa al prossimo)
            likeCard();
        } else if (deltaX < -swipeThreshold) {
            // Swipe a sinistra - reject (torna al precedente)
            rejectCard();
        } else {
            // Ritorna alla posizione originale
            resetCardPosition();
        }
    } else {
        // Se per qualche motivo non ci sono changedTouches, resettiamo la posizione
        resetCardPosition();
    }
    
    isDragging = false;
}

// Funzione per ripristinare la posizione della card
function resetCardPosition() {
    if (currentCardIndex >= cards.length) return;
    
    cards[currentCardIndex].style.transform = 'scale(1) translateY(0) rotate(0deg)';
    cards[currentCardIndex].style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
}

// Funzione per gestire lo swipe a destra (like - prossima card)
function likeCard() {
    if (isAnimating || currentCardIndex >= cards.length) return;
    isAnimating = true;
    
    // Anima la card fuori dallo schermo verso destra
    const currentCard = cards[currentCardIndex];
    currentCard.style.animation = 'swipeRight 0.5s forwards';
    currentCard.style.opacity = '0';
    
    // Passa alla card successiva
    setTimeout(() => {
        moveToNextCard();
        isAnimating = false;
    }, 300);
}

// Funzione per gestire lo swipe a sinistra (reject - card precedente)
function rejectCard() {
    if (isAnimating || currentCardIndex >= cards.length) return;
    isAnimating = true;
    
    // Anima la card corrente fuori dallo schermo verso sinistra
    cards[currentCardIndex].style.animation = 'swipeLeft 0.5s forwards';
    cards[currentCardIndex].style.opacity = '0';
    
    // Torna alla card precedente
    setTimeout(() => {
        moveToPrevCard();
        isAnimating = false;
    }, 300);
}

// Funzione per passare alla card successiva
function moveToNextCard() {
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Riposiziona la card vecchia
    cards[currentCardIndex].style.animation = '';
    cards[currentCardIndex].style.zIndex = '0';
    cards[currentCardIndex].style.transform = 'scale(0.8) translateY(30px)';
    
    // Incrementa l'indice della card corrente
    currentCardIndex = (currentCardIndex + 1) % totalCards;
    
    // Riorganizza le card
    updateCardsPosition();
}

// Funzione per passare alla card precedente
function moveToPrevCard() {
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Decrementa l'indice della card corrente
    currentCardIndex = (currentCardIndex - 1 + totalCards) % totalCards;
    
    // Resetta la trasformazione della nuova card corrente
    cards[currentCardIndex].style.animation = '';
    cards[currentCardIndex].style.transform = 'translateX(-1000px) rotate(-30deg)';
    cards[currentCardIndex].style.opacity = '1';
    cards[currentCardIndex].style.zIndex = totalCards.toString();
    
    // Anima il ritorno della card
    setTimeout(() => {
        cards[currentCardIndex].style.transform = 'scale(1) translateY(0) rotate(0deg)';
        
        // Riorganizza le card
        updateCardsPosition();
    }, 50);
}

// Funzione per aggiornare la posizione di tutte le card
function updateCardsPosition() {
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    cards.forEach((card, index) => {
        // Calcola la posizione relativa rispetto alla card corrente
        let relativePos = (index - currentCardIndex + totalCards) % totalCards;
        
        // Imposta z-index
        card.style.zIndex = (totalCards - relativePos).toString();
        
        // Imposta trasformazione e opacità
        if (relativePos === 0) {
            // Card corrente
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0) rotate(0deg)';
            card.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
        } else {
            // Card successive
            card.style.opacity = relativePos < 3 ? (0.85 - (relativePos * 0.15)).toString() : '0';
            card.style.transform = `scale(${0.95 - (relativePos * 0.05)}) translateY(${relativePos * 8}px) rotate(0deg)`;
            card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Function to view project details
function viewProject() {
    if (!cards || currentCardIndex >= cards.length || isAnimating) return;
    
    const projectId = cards[currentCardIndex].getAttribute('data-project-id');
    if (projectId) {
        const projectElement = document.getElementById(`project${projectId}`);
        if (projectElement) {
            // Crea overlay e apri il modale
            document.body.classList.add('modal-open');
            
            // Verifica se lo sfondo modale esiste già
            let modalBackdrop = document.querySelector('.modal-backdrop');
            if (!modalBackdrop) {
                modalBackdrop = document.createElement('div');
                modalBackdrop.className = 'modal-backdrop';
                document.body.appendChild(modalBackdrop);
            }
            
            // Mostra l'overlay con una transizione
            modalBackdrop.style.display = 'block';
            setTimeout(() => {
                modalBackdrop.style.opacity = '1';
            }, 10);
            
            // Mostra i dettagli del progetto con una transizione
            projectElement.style.display = 'block';
            projectElement.style.opacity = '0';
            setTimeout(() => {
                projectElement.style.opacity = '1';
            }, 10);
            
            // Aggiungi funzionalità di chiusura allo sfondo
            modalBackdrop.addEventListener('click', function() {
                closeProject(`project${projectId}`);
            });
        }
    }
}

// Function to close project details
function closeProject(projectId) {
    const projectElement = document.getElementById(projectId);
    if (projectElement) {
        // Animazione di chiusura
        projectElement.style.opacity = '0';
        
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.style.opacity = '0';
        }
        
        // Dopo la transizione, nascondi gli elementi
        setTimeout(() => {
            projectElement.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            if (modalBackdrop) {
                modalBackdrop.style.display = 'none';
            }
        }, 300);
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Aggiungi event listener ai pulsanti swipe
    const rejectBtn = document.querySelector('.swipe-button.reject');
    const viewBtn = document.querySelector('.swipe-button.view');
    const likeBtn = document.querySelector('.swipe-button.like');
    
    if (rejectBtn) rejectBtn.addEventListener('click', rejectCard);
    if (viewBtn) viewBtn.addEventListener('click', viewProject);
    if (likeBtn) likeBtn.addEventListener('click', likeCard);
    
    // Aggiungi funzionalità al pulsante di chiusura per tutti i popup dei progetti
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.closest('.project-details').id;
            if (projectId) {
                closeProject(projectId);
            }
        });
    });

    // Abilita la navigazione da tastiera
    document.addEventListener('keydown', function(e) {
        // Verifica se un modale è aperto
        const isModalOpen = document.body.classList.contains('modal-open');
        
        if (isModalOpen) {
            // Se il modale è aperto, permetti solo di chiuderlo con ESC
            if (e.key === 'Escape') {
                const visibleProject = document.querySelector('.project-details[style*="display: block"]');
                if (visibleProject) {
                    closeProject(visibleProject.id);
                }
            }
        } else {
            // Altrimenti, permetti la navigazione normale
            if (e.key === 'ArrowLeft') {
                rejectCard();
            } else if (e.key === 'ArrowRight') {
                likeCard();
            } else if (e.key === 'Enter' || e.key === ' ') {
                viewProject();
            }
        }
    });
}

// Aggiungi le animazioni CSS necessarie se non esistono già
function addCSSAnimations() {
    // Verifica se le animazioni esistono già
    let styleSheet = document.getElementById('card-animations');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'card-animations';
        styleSheet.innerHTML = `
            @keyframes swipeRight {
                to {
                    transform: translateX(1000px) rotate(30deg);
                    opacity: 0;
                }
            }
            
            @keyframes swipeLeft {
                to {
                    transform: translateX(-1000px) rotate(-30deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// Initialize everything on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    addCSSAnimations();
    initCards();
    setupEventListeners();
});
// Script JavaScript per il portfolio

document.addEventListener('DOMContentLoaded', function() {
    // Elementi del sistema di swipe per le card
    const cards = document.querySelectorAll('.card');
    const likeButton = document.querySelector('.like');
    const rejectButton = document.querySelector('.reject');
    const viewButton = document.querySelector('.view');
    const projectDetails = document.querySelectorAll('.project-details');
    const closeButtons = document.querySelectorAll('.close-btn');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    
    let currentCardIndex = 0;
    
    // Funzione per mostrare solo la card corrente
    function updateCards() {
        cards.forEach((card, index) => {
            card.classList.remove('active');
            if (index === currentCardIndex) {
                card.classList.add('active');
            }
        });
    }
    
    // Passare alla card successiva
    likeButton.addEventListener('click', function() {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            updateCards();
        }
    });
    
    // Tornare alla card precedente
    rejectButton.addEventListener('click', function() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateCards();
        }
    });
    
    // Visualizzare i dettagli del progetto
    viewButton.addEventListener('click', function() {
        const currentCard = cards[currentCardIndex];
        const projectId = currentCard.getAttribute('data-project-id');
        const projectDetail = document.getElementById('project' + projectId);
        
        if (projectDetail) {
            projectDetail.style.display = 'block';
            modalBackdrop.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Impedisce lo scroll della pagina
        }
    });
    
    // Chiudere i dettagli del progetto
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            projectDetails.forEach(detail => {
                detail.style.display = 'none';
            });
            modalBackdrop.style.display = 'none';
            document.body.style.overflow = ''; // Ripristina lo scroll della pagina
        });
    });
    
    // Chiudere i dettagli del progetto cliccando fuori
    modalBackdrop.addEventListener('click', function() {
        projectDetails.forEach(detail => {
            detail.style.display = 'none';
        });
        modalBackdrop.style.display = 'none';
        document.body.style.overflow = ''; // Ripristina lo scroll della pagina
    });
    
    // Gestione pulsante scroll-to-top
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopButton.classList.add('visible');
        } else {
            scrollToTopButton.classList.remove('visible');
        }
    });
    
    scrollToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Gestione della tastiera per accessibilità
    document.addEventListener('keydown', function(e) {
        // Esc per chiudere i popup
        if (e.key === 'Escape') {
            projectDetails.forEach(detail => {
                if (detail.style.display === 'block') {
                    detail.style.display = 'none';
                    modalBackdrop.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Frecce sinistra/destra per navigare tra le card
        if (e.key === 'ArrowLeft') {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                updateCards();
            }
        } else if (e.key === 'ArrowRight') {
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                updateCards();
            }
        }
        
        // Enter per visualizzare i dettagli del progetto attivo
        if (e.key === 'Enter' && document.activeElement === viewButton) {
            viewButton.click();
        }
    });
});