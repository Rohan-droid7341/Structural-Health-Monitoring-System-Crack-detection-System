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

  // Create a FileReader to convert the image file to Base64
  const reader = new FileReader();
  reader.onload = async (event) => {
    // Clear card and display image preview
    card.innerHTML = '';
    const img = document.createElement('img');
    img.src = event.target.result;
    card.appendChild(img);

    // Add loader element
    const loader = document.createElement('div');
    loader.className = 'loader';
    card.appendChild(loader);

    // Extract the Base64 string (remove header info)
    const base64String = event.target.result.split(',')[1];

    try {
      // Send the image to the backend via POST
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String })
      });

      // Wait for and process the JSON response
      const data = await response.json();

      // Remove loader
      loader.remove();

      // Update styling for the card
      card.style.borderStyle = 'solid';
      card.style.borderColor = "#89c2d9";
      card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      document.querySelector('.container').style.justifyContent = 'space-evenly';

      // Show the details card
      detailsCard.style.display = 'block';

      // Update the details card with data from the backend
      // Adjust these lines based on the JSON structure your backend returns
      document.getElementById('class').textContent = data.road_condition || 'N/A';
      // For example, if your backend returns dimensions, crack type, and number of damages:
      document.getElementById('dimensions').textContent = data.dimensions || 'N/A';
      document.getElementById('crackType').textContent = data.crack_type || 'N/A';
      document.getElementById('damages').textContent = data.crack_count || 'N/A';

    } catch (error) {
      console.error('Error during prediction:', error);
      loader.remove();
      card.innerHTML += '<p style="color:red;">An error occurred. Please try again.</p>';
    }
  };
  reader.readAsDataURL(file);
}

function resetCard() {
  card.innerHTML = '';
  card.innerHTML = '<span>Drag & Drop an Image</span>';
  card.appendChild(browseBtn);
  card.style.transform = 'translateX(0)';
  detailsCard.style.display = 'none';
}
