{
  const body = document.body;

  // Helper functions
  const MathUtils = {
    lerp: (a, b, n) => (1 - n) * a + n * b,
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  };

  document.querySelector('.clickable-area').addEventListener('click', () => {
    window.location.href = 'menu.html';
  });

  // Get the mouse or touch position
  const getPointerPos = (ev) => {
    let posx = 0;
    let posy = 0;
    if (ev.touches && ev.touches.length > 0) {
      posx = ev.touches[0].clientX;
      posy = ev.touches[0].clientY;
    } else if (ev.pageX || ev.pageY) {
      posx = ev.pageX;
      posy = ev.pageY;
    } else if (ev.clientX || ev.clientY) {
      posx = ev.clientX + body.scrollLeft + document.documentElement.scrollLeft;
      posy = ev.clientY + body.scrollTop + document.documentElement.scrollTop;
    }
    return { x: posx, y: posy };
  };

  let mousePos = (lastMousePos = cacheMousePos = { x: 0, y: 0 });

  // Update the mouse/touch position
  const updatePointerPos = (ev) => {
    if (ev.touches && ev.touches.length > 0) {
      const touches = [...ev.touches];
      mousePos = {
        x: touches[0].clientX,
        y: touches[0].clientY,
      };

      // Handle multi-touch for additional effects
      if (touches.length > 1) {
        cacheMousePos = {
          x: touches[1].clientX,
          y: touches[1].clientY,
        };
      }
    } else {
      mousePos = getPointerPos(ev);
    }
  };

  // Add event listeners for mouse and touch
  window.addEventListener("mousemove", updatePointerPos);
  window.addEventListener("touchmove", updatePointerPos, { passive: true });

  const getMouseDistance = () =>
    MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);

  class Image {
    constructor(el) {
      this.DOM = { el: el };
      this.defaultStyle = {
        scale: 1,
        x: 0,
        y: 0,
        opacity: 0,
      };
      this.getRect();
    }

    getRect() {
      this.rect = this.DOM.el.getBoundingClientRect();
    }
    isActive() {
      return TweenMax.isTweening(this.DOM.el) || this.DOM.el.style.opacity != 0;
    }
  }

  class ImageTrail {
    constructor() {
      this.DOM = { content: document.querySelector(".content") };
      this.images = [];
      [...this.DOM.content.querySelectorAll("img")].forEach((img) =>
        this.images.push(new Image(img))
      );
      this.imagesTotal = this.images.length;
      this.imgPosition = 0;
      this.zIndexVal = 1;
      this.threshold = 100;
      requestAnimationFrame(() => this.render());
    }
    render() {
      let distance = getMouseDistance();
      cacheMousePos.x = MathUtils.lerp(
        cacheMousePos.x || mousePos.x,
        mousePos.x,
        0.1
      );
      cacheMousePos.y = MathUtils.lerp(
        cacheMousePos.y || mousePos.y,
        mousePos.y,
        0.1
      );

      if (distance > this.threshold) {
        this.showNextImage();

        ++this.zIndexVal;
        this.imgPosition = Math.floor(Math.random() * this.imagesTotal);

        lastMousePos = mousePos;
      }

      let isIdle = true;
      for (let img of this.images) {
        if (img.isActive()) {
          isIdle = false;
          break;
        }
      }
      if (isIdle && this.zIndexVal !== 1) {
        this.zIndexVal = 1;
      }

      requestAnimationFrame(() => this.render());
    }
    showNextImage() {
      const img = this.images[this.imgPosition];
      TweenMax.killTweensOf(img.DOM.el);

      new TimelineMax()
        .set(
          img.DOM.el,
          {
            startAt: { opacity: 0, scale: 1.5 }, // Larger initial scale for touch
            opacity: 1,
            scale: 1,
            zIndex: this.zIndexVal,
            x: cacheMousePos.x - img.rect.width / 2,
            y: cacheMousePos.y - img.rect.height / 2,
          },
          0
        )
        .to(
          img.DOM.el,
          0.9,
          {
            ease: Expo.easeOut,
            x: mousePos.x - img.rect.width / 2,
            y: mousePos.y - img.rect.height / 2,
            scale: 1.2, // Add a slight zoom-in effect
          },
          0
        )
        .to(
          img.DOM.el,
          1,
          {
            ease: Power1.easeOut,
            opacity: 0.5, // Fade slower for touch
          },
          0.4
        )
        .to(
          img.DOM.el,
          1,
          {
            ease: Quint.easeOut,
            scale: 0.5, // Shrink less aggressively
          },
          0.4
        );

      // Add haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50); // Vibrate for 50ms
      }
    }
  }

  // Preload images
  const preloadImages = () => {
    return new Promise((resolve, reject) => {
      imagesLoaded(document.querySelectorAll(".content__img"), resolve);
    });
  };

  preloadImages().then(() => {
    new ImageTrail();
  });
}
