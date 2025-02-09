const card = document.getElementById('card');
    const browseBtn = document.getElementById('browseBtn');
    const detailsCard = document.getElementById('detailsCard');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    function showUploadSection() {
      document.querySelector('.hero1').style.display = 'block';
      document.querySelector('.hero1').scrollIntoView({ behavior: 'smooth' });
    }
    // Handle drag and drop
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('dragover');
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('dragover');
    });

    card.addEventListener('drop', async (e) => {
      e.preventDefault();
      card.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      handleFile(file);
    });

    // Handle manual browsing
    browseBtn.addEventListener('click', () => input.click());

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      handleFile(file);
    });

    async function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;

      // Show preview and loader
      const reader = new FileReader();
      reader.onload = (event) => {
        card.innerHTML = '';
        const img = document.createElement('img');
        img.src = event.target.result;
        card.appendChild(img);

        // Add loader
        const loader = document.createElement('div');
        loader.className = 'loader';
        card.appendChild(loader);
      };
      reader.readAsDataURL(file);

      // Simulate backend processing
      setTimeout(() => {
        // Remove loader
        const container = document.querySelector('.container');
        card.querySelector('.loader').remove();
        card.style.borderStyle = 'solid';
        card.style.borderColor = "#89c2d9";
        card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        container.style.justifyContent = 'space-evenly';
        // Shift the image card to the left
        // Show the details card
        detailsCard.style.display = 'block';
        
        // Populate sample details (replace with actual data from backend)
        document.getElementById('class').textContent = 'Good';
        document.getElementById('dimensions').textContent = 'Depth: 10cm, Length: 50cm, Breadth: 30cm';
        document.getElementById('crackType').textContent = 'Pothole';
        document.getElementById('damages').textContent = '3';
      }, 2000); // Simulate 2 seconds of backend processing
    }

    function resetCard() {
      card.innerHTML = '';
      card.innerHTML = '<span>Drag & Drop an Image</span>';
      card.appendChild(browseBtn);
      card.style.transform = 'translateX(0)';
      detailsCard.style.display = 'none';
    }