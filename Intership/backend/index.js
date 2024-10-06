const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON request bodies

const usersFilePath = path.join(__dirname, 'users.json');

// Configure Multer for file uploads (image only - JPG, PNG)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp for filename
  }
});

const upload = multer({ storage });

// Helper function to read users from file
const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if there is an error reading the file
  }
};

// Helper function to write users to file
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

// Initialize the users file with an empty array if it doesn't exist
const initializeUsersFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    writeUsersToFile([]);
  }
};

initializeUsersFile();

// Signup route
app.post('/api/signup', upload.single('image'), (req, res) => {
  const { username, password, email, mobile, gender, destination } = req.body;
  const image = req.file;

  // Validate required fields
  if (!username || !password || !email || !mobile) {
    return res.status(400).json({ message: 'Username, password, email, and mobile are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate mobile number
  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Mobile number must be 10 digits' });
  }

  const users = readUsersFromFile();

  // Check if the username or email already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Save new user
  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    mobile,
    gender: gender || null,
    destination: destination || null,
    image: image ? image.filename : null // Save image file name if provided
  };

  users.push(newUser);
  writeUsersToFile(users);
  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = readUsersFromFile();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(400).json({ message: 'Invalid username or password' });
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Update user route
app.put('/api/users/:id', upload.single('image'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { username, password, email, mobile, gender, destination } = req.body;
  const image = req.file;

  let users = readUsersFromFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Update only the fields provided by the user
  if (username) {
    if (users.some(user => user.username === username && user.id !== userId)) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    users[userIndex].username = username;
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (users.some(user => user.email === email && user.id !== userId)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    users[userIndex].email = email;
  }

  if (password) {
    users[userIndex].password = password;
  }

  if (mobile) {
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits' });
    }
    users[userIndex].mobile = mobile;
  }

  if (gender) {
    users[userIndex].gender = gender;
  }

  if (destination) {
    users[userIndex].destination = destination;
  }

  if (image) {
    users[userIndex].image = image.filename;
  }

  writeUsersToFile(users); // Save updated array to file

  res.json({ message: 'User updated successfully', user: users[userIndex] });
});

// Get all users route
app.get('/api/users', (req, res) => {
  const users = readUsersFromFile();
  res.json(users);
});

app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);

  let users = readUsersFromFile(); // Read the current users list from the file

  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // If the user has an associated image, delete the image file from the server
  const user = users[userIndex];
  if (user.image) {
    const fs = require('fs');
    const imagePath = `uploads/${user.image}`; // Assuming your images are stored in the "uploads" folder
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image:', err);
      } else {
        console.log(`Deleted image: ${imagePath}`);
      }
    });
  }

  // Remove the user from the array
  users.splice(userIndex, 1);

  writeUsersToFile(users); // Save the updated users array back to the file

  res.json({ message: 'User deleted successfully' });
});

//   const { id } = req.params;
//   // Logic to find and delete the user by ID from the database or file
//   // For example:
//   const userIndex = users.findIndex(user => user.id === id);
//   if (userIndex !== -1) {
//     users.splice(userIndex, 1);
//     res.status(200).json({ message: 'User deleted successfully!' });
//   } else {
//     res.status(404).json({ message: 'User not found.' });
//   }
// });

// Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
