let currentPin = ""; // Store the current pin for sending
let currentQRData = ""; // Store the QR data to be sent
let scanMode = false; // Flag for determining if the camera is active

// Start scanning QR Code
function startScan() {
  scanMode = true;
  const video = document.getElementById("video");
  video.style.display = "block";
  const canvasElement = document.createElement("canvas");
  const canvas = canvasElement.getContext("2d");

  // Access the camera
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();
      
      // Adjust video element size to match canvas
      video.width = 300;
      video.height = 200;
      canvasElement.width = video.width;
      canvasElement.height = video.height;
      
      scanQRCode(video, canvas, canvasElement);
    })
    .catch(function(error) {
      console.error("Error accessing the camera: ", error);
    });
}

// Function to scan the QR code
function scanQRCode(video, canvas, canvasElement) {
  if (!scanMode) return;

  // Draw video frame to canvas
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const code = jsQR(imageData.data, canvasElement.width, canvasElement.height, {
    inversionAttempts: "dontInvert",
  });

  if (code) {
    // If QR code is found, populate the QR data
    document.getElementById("qr-data").value = code.data; // The QR code data
    currentQRData = code.data;
    stopScan(video);
  } else {
    // Keep scanning until a QR code is found
    requestAnimationFrame(() => scanQRCode(video, canvas, canvasElement));
  }
}

// Stop scanning
function stopScan(video) {
  video.srcObject.getTracks().forEach(track => track.stop());
  video.style.display = "none";
  scanMode = false;
}

// Send Data with Pin
function sendData() {
  const pin = document.getElementById("pin-input-send").value;
  if (pin.length === 6 && currentQRData) {
    currentPin = pin; // Store the pin
    alert("Data sent with PIN: " + pin);
    // You can store the QR data and pin on your backend here for real-time transfer (e.g., using WebSocket or Firebase).
  } else {
    alert("Please enter a valid 6-digit PIN and scan a QR code.");
  }
}

// Receive Data with Pin
function receiveData() {
  const pin = document.getElementById("pin-input-receive").value;
  if (pin === currentPin) {
    // Display the received QR data text
    document.getElementById("received-data").innerText = "Received QR Data: " + currentQRData;
  } else {
    alert("Invalid PIN entered.");
  }
}
