/**
 * YinDesign 音嘚赞官网交互脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // 移动端导航菜单切换
    // ========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.style.transform = navMenu.classList.contains('active') 
                    ? index === 0 ? 'rotate(45deg) translate(5px, 5px)'
                    : index === 1 ? 'opacity: 0'
                    : 'rotate(-45deg) translate(5px, -5px)'
                    : '';
            });
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('active'));
        });
    }
    
    // ========================================
    // 滚动时导航栏样式变化
    // ========================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        navbar.style.boxShadow = window.scrollY > 100 ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none';
    });
    
    // ========================================
    // 平滑滚动到锚点
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - navbar.offsetHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // 功能卡片滚动动画
    // ========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.feature-card, .pricing-card, .tutorial-card, .scenario-item').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
        observer.observe(el);
    });
    
    // ========================================
    // Hero 轮播图（前景 + 背景同步）
    // ========================================
    const carousel = document.getElementById('heroCarousel');
    const bgCarousel = document.getElementById('heroBgCarousel');
    const bgSlides = bgCarousel ? bgCarousel.querySelectorAll('.hero-bg-slide') : [];
    
    if (carousel) {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        let currentSlide = 0;
        let autoPlayTimer = null;
        const AUTO_PLAY_INTERVAL = 4000;
        
        function goToSlide(index) {
            // 前景轮播切换
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
            // 背景轮播同步切换
            bgSlides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
        }
        
        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }
        
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
        }
        
        function stopAutoPlay() {
            if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
        }
        
        // 按钮事件
        if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); prevSlide(); startAutoPlay(); });
        if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); nextSlide(); startAutoPlay(); });
        
        // 圆点事件
        dots.forEach(dot => {
            dot.addEventListener('click', function(e) {
                e.stopPropagation();
                goToSlide(parseInt(this.dataset.index));
                startAutoPlay();
            });
        });
        
        // 鼠标悬停暂停
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        
        // 触摸滑动支持
        let touchStartX = 0;
        carousel.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
        carousel.addEventListener('touchend', function(e) {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? nextSlide() : prevSlide();
                startAutoPlay();
            }
        });
        
        // 启动自动轮播
        startAutoPlay();
        
        // 点击打开灯箱
        carousel.addEventListener('click', function(e) {
            // 如果点击的是按钮或圆点，不打开灯箱
            if (e.target.closest('.carousel-arrow') || e.target.closest('.carousel-dot')) return;
            const img = slides[currentSlide].querySelector('img');
            if (img) openLightbox(currentSlide);
        });
    }
    
    // ========================================
    // 灯箱（图片放大查看）
    // ========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    let lightboxIndex = 0;
    
    function getCarouselImages() {
        const slides = document.querySelectorAll('.carousel-slide img');
        return Array.from(slides).map(img => ({ src: img.src, alt: img.alt }));
    }
    
    function openLightbox(index) {
        if (!lightbox) return;
        const images = getCarouselImages();
        lightboxIndex = index;
        lightboxImg.src = images[lightboxIndex].src;
        lightboxImg.alt = images[lightboxIndex].alt;
        if (lightboxCaption) lightboxCaption.textContent = images[lightboxIndex].alt;
        lightbox.hidden = false;
        // 触发重排以启动过渡动画
        requestAnimationFrame(() => lightbox.classList.add('active'));
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        setTimeout(() => { lightbox.hidden = true; document.body.style.overflow = ''; }, 300);
    }
    
    function lightboxPrevSlide() {
        const images = getCarouselImages();
        lightboxIndex = (lightboxIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[lightboxIndex].src;
        lightboxImg.alt = images[lightboxIndex].alt;
        if (lightboxCaption) lightboxCaption.textContent = images[lightboxIndex].alt;
    }
    
    function lightboxNextSlide() {
        const images = getCarouselImages();
        lightboxIndex = (lightboxIndex + 1) % images.length;
        lightboxImg.src = images[lightboxIndex].src;
        lightboxImg.alt = images[lightboxIndex].alt;
        if (lightboxCaption) lightboxCaption.textContent = images[lightboxIndex].alt;
    }
    
    if (lightbox) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });
        if (lightboxPrev) lightboxPrev.addEventListener('click', lightboxPrevSlide);
        if (lightboxNext) lightboxNext.addEventListener('click', lightboxNextSlide);
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lightboxPrevSlide();
            if (e.key === 'ArrowRight') lightboxNextSlide();
        });
    }
    
    // ========================================
    // 订阅按钮点击事件
    // ========================================
    document.querySelectorAll('.pricing-card .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const planName = this.closest('.pricing-card').querySelector('.pricing-name').textContent;
            alert('即将跳转到订阅页面：' + planName + '\n\n此功能正在开发中，敬请期待！');
        });
    });
    
    // 下载按钮点击事件
    const downloadBtn = document.querySelector('.download .btn-primary');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('下载功能正在开发中，敬请期待！\n\n当前版本：副墨v26.0\n支持平台：macOS + InDesign');
        });
    }
});
