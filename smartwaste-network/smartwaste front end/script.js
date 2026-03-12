// script.js

document.addEventListener('DOMContentLoaded', function() {
    
    // Define the base URL for your backend API
    const API_BASE_URL = 'http://localhost:5000/api';
    
    // ===================================================================
    // ===== 1. ANIMATION & EXCLUSIVE TOGGLE LOGIC (NEW CORE FUNCTION) =====
    // ===================================================================
    
    // Function to handle the animated appearance and prevent unwanted scrolling
    function handleFeatureClick(card, sectionId) {
        card.addEventListener('click', function(e) {
            e.preventDefault(); // Prevents unwanted scrolling/navigation
            
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                // Check if the clicked section is already visible
                const isCurrentlyVisible = targetSection.classList.contains('is-visible');

                // 1. Close ALL other open sections first (Post Waste & Request Material)
                document.querySelectorAll('.post-waste-section, .request-material-section').forEach(section => {
                    section.classList.remove('is-visible');
                });

                // 2. TOGGLE: If it was closed, open it now
                if (!isCurrentlyVisible) {
                    targetSection.classList.add('is-visible'); 
                    
                    // 3. Scroll down to the newly shown section after a slight delay 
                    // (Allows CSS animation to start before scrolling, preventing jump)
                    setTimeout(() => {
                        targetSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 50); 
                }
            }
        });
    }

    // --- Post Your Waste ---
    const postWasteCard = document.querySelector('.features-grid .feature-card:nth-child(1)');
    if (postWasteCard) {
        handleFeatureClick(postWasteCard, 'post-waste');
    }
    
    // --- Request Materials ---
    const requestMaterialCard = document.querySelector('.features-grid .feature-card:nth-child(2)');
    if (requestMaterialCard) {
        handleFeatureClick(requestMaterialCard, 'request-material');
    }

    // ===========================================
    // ===== 2. NAVIGATION & SCROLLING LOGIC =====
    // ===========================================
    
    // Handles smooth scrolling for all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // If the href is exactly "#" ignore (common pattern). Still prevent default.
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Handles the smooth scroll from the Hero section CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            const contactEl = document.getElementById('contact');
            if (contactEl) {
                contactEl.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // ==================================================
    // ===== 3. CONTACT FORM HANDLING (/api/contact) =====
    // ==================================================
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const company = this.company?.value || '';
            const email = this.email?.value || '';
            const phone = this.phone?.value || ''; 
            const message = this.message?.value || '';
            
            const API_URL = `${API_BASE_URL}/contact`;
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        company: company,
                        email: email,
                        phone: phone, 
                        message: message
                    })
                });

                if (response.ok) {
                    alert('Success! Your message has been sent to the server.');
                    this.reset();
                } else {
                    let errorText = response.statusText;
                    try {
                        const errorData = await response.json(); 
                        errorText = errorData.error || errorText;
                    } catch (err) {
                        // ignore JSON parse errors
                    }
                    alert(`Submission failed: ${errorText}`);
                }

            } catch (error) {
                console.error('Fetch error:', error);
                alert('A network error occurred. Is the backend server running on port 5000?');
            }
        });
    }
    
    // ======================================================
    // ===== 4. POST WASTE FORM HANDLING (/api/waste) =====
    // ======================================================

    const wasteForm = document.getElementById('wasteForm');
    if (wasteForm) {
        wasteForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = this.name?.value || '';
            const type = this.type?.value || '';
            const quantity = this.quantity?.value || '';
            const location = this.location?.value || '';
            const description = this.description?.value || '';
            
            const API_URL = `${API_BASE_URL}/waste`; 
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        type: type,
                        quantity: quantity,
                        location: location,
                        description: description
                    })
                });

                if (response.ok) {
                    alert('Success! Your waste listing has been posted.');
                    this.reset();
                } else {
                    let errorText = response.statusText;
                    try {
                        const errorData = await response.json();
                        errorText = errorData.error || errorText;
                    } catch (err) {
                        // ignore
                    }
                    alert(`Listing failed: ${errorText}`);
                }

            } catch (error) {
                console.error('Fetch error:', error);
                alert('A network error occurred while posting waste. Is the backend server running?');
            }
        });
    }

    // ============================================================
    // ===== 5. REQUEST FORM HANDLING (/api/request) - NEW =====
    // ============================================================

    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const material = this.material?.value || '';
            const category = this.category?.value || '';
            const requiredQuantity = this.requiredQuantity?.value || '';
            const useCase = this.useCase?.value || '';
            
            const API_URL = `${API_BASE_URL}/request`; 
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        material,
                        category,
                        requiredQuantity,
                        useCase
                    })
                });

                if (response.ok) {
                    alert('Success! Your material request has been submitted.');
                    this.reset();
                } else {
                    let errorText = response.statusText;
                    try {
                        const errorData = await response.json();
                        errorText = errorData.error || errorText;
                    } catch (err) {
                        // ignore
                    }
                    alert(`Request failed: ${errorText}`);
                }

            } catch (error) {
                console.error('Fetch error:', error);
                alert('A network error occurred. Is the backend server running?');
            }
        });
    }
});
