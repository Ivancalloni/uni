// Scroll to top function
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Swipe card functionality
let currentCardIndex = 0;
const cards = document.querySelectorAll('.card');
const totalCards = cards.length;
const projects = document.querySelectorAll('.project-details');
const overlay = document.getElementById('projectOverlay');

// Initialize cards
function initCards() {
    if (!cards || cards.length === 0) return;
    
    cards.forEach((card, index) => {
        card.style.zIndex = totalCards - index;
        if (index > 0) {
            card.style.opacity = 0;
            card.style.transform = 'scale(0.95) translateY(10px)';
        } else {
            // Assicuriamoci che la prima card sia visibile
            card.style.opacity = 1;
            card.style.transform = 'scale(1) translateY(0)';
        }
    });
}

// Execute initCards on page load with proper DOM check
document.addEventListener('DOMContentLoaded', function() {
    initCards();
    setupEventListeners();
});

// Function to go to the next card
function nextCard() {
    if (!cards || cards.length <= 1) return;
    
    if (currentCardIndex < totalCards - 1) {
        // Hide current card
        cards[currentCardIndex].style.transform = 'translateX(-200px) rotate(-30deg)';
        cards[currentCardIndex].style.opacity = 0;
        
        // After animation, reposition card at the bottom of the stack
        setTimeout(() => {
            cards[currentCardIndex].style.transform = 'scale(0.95) translateY(10px)';
            cards[currentCardIndex].style.zIndex = 0;
            
            // Rearrange all cards z-indexes
            for (let i = 0; i < totalCards; i++) {
                if (i !== currentCardIndex) {
                    const newZIndex = parseInt(cards[i].style.zIndex, 10) + 1;
                    cards[i].style.zIndex = newZIndex;
                }
            }
            
            // Move to next card and show it
            currentCardIndex = (currentCardIndex + 1) % totalCards;
            cards[currentCardIndex].style.opacity = 1;
            cards[currentCardIndex].style.transform = 'scale(1) translateY(0)';
            cards[currentCardIndex].style.zIndex = totalCards;
        }, 300);
    }
}

// Function to go to the previous card
function prevCard() {
    if (!cards || cards.length <= 1) return;
    
    // Find the previous card index
    const prevIndex = (currentCardIndex - 1 + totalCards) % totalCards;
    
    // Show the previous card by bringing it to front
    cards[prevIndex].style.opacity = 1;
    cards[prevIndex].style.transform = 'translateX(-200px) rotate(-30deg)';
    cards[prevIndex].style.zIndex = totalCards + 1;
    
    // Animate it coming in
    setTimeout(() => {
        cards[prevIndex].style.transform = 'scale(1) translateY(0)';
        
        // Hide current card
        cards[currentCardIndex].style.opacity = 0;
        cards[currentCardIndex].style.transform = 'scale(0.95) translateY(10px)';
        
        // Rearrange z-indexes
        for (let i = 0; i < totalCards; i++) {
            if (i !== prevIndex) {
                const newZIndex = parseInt(cards[i].style.zIndex, 10) - 1;
                cards[i].style.zIndex = Math.max(0, newZIndex); // Ensure no negative z-indexes
            }
        }
        
        currentCardIndex = prevIndex;
    }, 50);
}

// Function to view project details
function viewProject() {
    if (!cards || currentCardIndex >= cards.length) return;
    
    const projectId = cards[currentCardIndex].getAttribute('data-project-id');
    if (projectId) {
        const projectElement = document.getElementById(`project${projectId}`);
        if (projectElement) {
            // Create overlay
            document.body.classList.add('modal-open');
            
            // Check if modal backdrop already exists
            let modalBackdrop = document.querySelector('.modal-backdrop');
            if (!modalBackdrop) {
                modalBackdrop = document.createElement('div');
                modalBackdrop.className = 'modal-backdrop';
                document.body.appendChild(modalBackdrop);
            }
            
            modalBackdrop.style.display = 'block';
            
            // Show project details
            projectElement.style.display = 'block';
            
            // Add close functionality to backdrop
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
        projectElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Hide backdrop
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.style.display = 'none';
        }
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Add event listeners to swipe buttons
    const rejectBtn = document.querySelector('.swipe-button.reject');
    const viewBtn = document.querySelector('.swipe-button.view');
    const likeBtn = document.querySelector('.swipe-button.like');
    
    if (rejectBtn) rejectBtn.addEventListener('click', prevCard);
    if (viewBtn) viewBtn.addEventListener('click', viewProject);
    if (likeBtn) likeBtn.addEventListener('click', nextCard);
    
    // Add close button functionality to all project popups
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.closest('.project-details').id;
            closeProject(projectId);
        });
    });

    // Enable keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevCard();
        } else if (e.key === 'ArrowRight') {
            nextCard();
        } else if (e.key === 'Enter') {
            viewProject();
        } else if (e.key === 'Escape') {
            const visibleProject = document.querySelector('.project-details[style*="display: block"]');
            if (visibleProject) {
                closeProject(visibleProject.id);
            }
        }
    });

    // Enable touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    
    const cardStack = document.querySelector('.card-stack');
    if (cardStack) {
        cardStack.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        cardStack.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        }, false);
    }
    
    function handleSwipeGesture() {
        if (touchEndX < touchStartX - 50) {
            // Swipe left
            nextCard();
        } else if (touchEndX > touchStartX + 50) {
            // Swipe right
            prevCard();
        } else {
            // Tap (small movement)
            viewProject();
        }
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Show/hide scroll-to-top button based on scroll position
    window.addEventListener('scroll', function() {
        const scrollToTopBtn = document.querySelector('.scroll-to-top');
        if (scrollToTopBtn) {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        }
    });

    // Form validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const privacyCheckbox = document.getElementById('privacy');
            
            let isValid = true;
            
            // Simple validation
            if (!nameInput.value.trim()) {
                nameInput.style.borderColor = 'red';
                isValid = false;
            } else {
                nameInput.style.borderColor = '#ccc';
            }
            
            if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
                emailInput.style.borderColor = 'red';
                isValid = false;
            } else {
                emailInput.style.borderColor = '#ccc';
            }
            
            if (!messageInput.value.trim()) {
                messageInput.style.borderColor = 'red';
                isValid = false;
            } else {
                messageInput.style.borderColor = '#ccc';
            }
            
            if (!privacyCheckbox.checked) {
                privacyCheckbox.parentElement.style.color = 'red';
                isValid = false;
            } else {
                privacyCheckbox.parentElement.style.color = 'inherit';
            }
            
            if (!isValid) {
                e.preventDefault();
                alert('Per favore, compila tutti i campi correttamente.');
            }
        });
    }
}

// Initialize everything on page load
window.onload = function() {
    // Check if initCards and setupEventListeners have already been called via DOMContentLoaded
    // This avoids double initialization issues
    const hasBeenInitialized = document.querySelectorAll('.card[style*="z-index"]').length > 0;
    
    if (!hasBeenInitialized) {
        initCards();
        setupEventListeners();
    }
    
    // Initially hide scroll-to-top button
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        scrollToTopBtn.style.display = 'none';
    }
};