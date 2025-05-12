// Main application class
class App {
  constructor() {
    this.globe = new Globe();
    this.isDarkTheme = true;
    this.starryBackground = null;
    this.stars = [];
  }

  // Initialize the application
  init() {
    console.log("Initializing application...");
    
    // Initialize the globe
    this.globe.init();
    
    // Create starry background
    this.createStarryBackground();
    
    // Get user location
    this.getUserLocation();
    
    // Setup theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    
    // Setup navigation
    this.setupNavigation();
    
    // Setup focus button
    document.getElementById('focus-location').addEventListener('click', () => {
      this.globe.focusOnUserLocation();
    });
    
    console.log("Application initialized");
  }

  // Get user's location
  getUserLocation() {
    console.log("Getting user location...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation successful");
          const { latitude, longitude } = position.coords;
          this.globe.userLocation = { latitude, longitude };
          
          // Add marker to globe
          this.globe.addUserLocationMarker(latitude, longitude);
          
          // Get location name using reverse geocoding
          this.getLocationName(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          this.showError("Could not access your location. Using approximate location based on your timezone.");
          this.fallbackToTimezone();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      this.showError("Your browser doesn't support geolocation. Using approximate location based on your timezone.");
      this.fallbackToTimezone();
    }
  }

  // Get location name from coordinates
  getLocationName(latitude, longitude) {
    console.log(`Getting location name for lat: ${latitude}, long: ${longitude}`);
    
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }
        return response.json();
      })
      .then(data => {
        console.log("Location data received:", data);
        const city = data.city || data.locality || "Unknown City";
        const country = data.countryName || "Unknown Country";
        document.getElementById('location').textContent = `${city}, ${country}`;
        
        // Start updating time
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
      })
      .catch(error => {
        console.error("Error fetching location data:", error);
        this.fallbackToTimezone();
      });
  }

  // Fallback to timezone-based location
  fallbackToTimezone() {
    console.log("Falling back to timezone-based location");
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let city = "Unknown Location";
    
    if (timezone) {
      const parts = timezone.split("/");
      if (parts.length > 1) {
        city = parts[parts.length - 1].replace(/_/g, " ");
      }
    }
    
    document.getElementById('location').textContent = city;
    
    // Start updating time
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  // Update time display
  updateTime() {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat("en-US", options);
    document.getElementById('time').textContent = formatter.format(new Date());
  }

  // Create starry background
  createStarryBackground() {
    console.log("Creating starry background");
    
    this.starryBackground = document.getElementById('starry-background');
    const ctx = this.starryBackground.getContext('2d');
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      this.starryBackground.width = window.innerWidth;
      this.starryBackground.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create stars
    this.stars = [];
    for (let i = 0; i < 500; i++) {
      this.stars.push({
        x: Math.random() * this.starryBackground.width,
        y: Math.random() * this.starryBackground.height,
        size: Math.random() * 1.5,
        opacity: Math.random() * 0.8 + 0.2
      });
    }
    
    // Animation loop
    const animateStars = () => {
      ctx.clearRect(0, 0, this.starryBackground.width, this.starryBackground.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, this.starryBackground.width, this.starryBackground.height);
      
      // Draw stars
      this.stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Twinkle effect
        star.opacity = Math.max(0.2, Math.min(1, star.opacity + (Math.random() - 0.5) * 0.05));
      });
      
      requestAnimationFrame(animateStars);
    };
    
    animateStars();
    console.log("Starry background created");
  }

  // Toggle theme
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.getElementById('theme-toggle').textContent = this.isDarkTheme ? '☀️' : '🌙';
    // In a real implementation, you would change more styles here
  }

  // Setup navigation
  setupNavigation() {
    console.log("Setting up navigation");
    
    // About section
    document.getElementById('about-link').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('about-section').style.display = 'block';
    });
    
    document.getElementById('close-about').addEventListener('click', function() {
      document.getElementById('about-section').style.display = 'none';
    });
    
    // Work section
    document.getElementById('work-link').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('work-section').style.display = 'block';
    });
    
    document.getElementById('close-work').addEventListener('click', function() {
      document.getElementById('work-section').style.display = 'none';
    });
  }

  // Show error message
  showError(message) {
    console.log("Showing error:", message);
    
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorElement.classList.remove('visible');
    }, 5000);
  }
}

// Create and initialize the application
const app = new App();

// Initialize when the page loads
window.addEventListener('load', () => {
  console.log("Page loaded, initializing app");
  app.init();
});

// Handle global errors
window.addEventListener('error', function(e) {
  console.error('Global error:', e.message);
  app.showError("An error occurred. Please try refreshing the page.");
});

