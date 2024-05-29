require("./Database/Config")
const express = require("express");
const app = express();
const cors = require("cors");
const multer = require('multer');
const Users = require("./Database/Users");
const Language = require("./Database/Language");
const Jwt = require("jsonwebtoken")
const jwtKey = "CodeBud"

app.use(cors());
app.use(express.json());
app.use('/',express.static("uploads"))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination directory for uploaded files
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop(); // Extract file extension
    cb(null, `${file.originalname}`); // Append timestamp and original filename with extension
  }
});
const upload = multer({ storage: storage });

app.post('/setQues', async (req, res) => {
  try {
    const { userId, languageName, topicName, questions } = req.body;

    // Check if user exists
    let user = await Users.findOne({ _id: userId });

    // If user not found, create new user
    if (!user) {
      user = new Users({ _id: userId });
    }

    // Check if the language exists, if not, create it
    let language = user.language.find(lang => lang.languageName === languageName);
    if (!language) {
      // Create new language with specified topic and questions
      language = { languageName: languageName, topics: [{ topicName: topicName, questions: questions }] };
      user.language.push(language);
    } else {
      // Check if the topic exists, if not, create it
      let topic = language.topics.find(tpc => tpc.topicName === topicName);
      if (!topic) {
        // Create new topic with specified questions
        topic = { topicName: topicName, questions: questions };
        language.topics.push(topic);
      } else {
        // Merge the new questions with existing ones
        topic.questions = [...topic.questions, ...questions];
      }
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signup", async (req, res) => {
  let user = new Users(req.body);
  let result = await user.save();
  res.send(result);
})

app.post("/login", async (req, res) => {
  let CUsername = req.body.username;
  let user = await Users.findOne({ username: CUsername });
  if (user) {
    let CPassword = req.body.password;
    let SPassword = user.password

    const UserId = {
      user: {
        id: user._id
      }
    }
    // let SUsername=user.username
    const authToken = Jwt.sign(UserId, jwtKey, { expiresIn: '3s' })

    if (CPassword === SPassword) {
      res.status(200).send({ user, authToken })

    } else {
      res.status(409).send("enter valid Password")
    }
  }
  else {
    res.status(404).send("User Not Found");
  }
});

app.get("/getUsers", async (req, res) => {
  let users = await Users.find()
  res.send(users)

})

app.post('/setQuestions', async (req, res) => {
  const { userId, languageName, topicName, questions } = req.body;

  // Find the user
  const user = await Users.findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const language = user.language.find(lang => lang.languageName === languageName);

  if (language) {
    const topic = language.topics.find(topic => topic.topicName === topicName);
    if (topic) {
      return res.json(topic.questions);
    }
    else {
      return res.send(questions);
    }
  }
  else {
    return res.send(questions);
  }
});

app.post('/addLanguage', async (req, res) => {
  try {
    const { userId, languageName } = req.body;

    // Check if the userId and languageName are provided in the request body
    if (!userId || !languageName) {
      return res.status(400).json({ error: 'userId and languageName are required' });
    }

    // Find the user by userId
    const user = await Users.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the languageName is already present in the user's language array
    if (user.language.some(lang => lang.languageName === languageName)) {
      return res.status(400).json({ error: 'Language already exists for this user' });
    }

    // Add the new language to the user's language array
    user.language.push({ languageName, topics: [] });
    await user.save();

    res.status(201).json({ message: 'Language added successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/getLanguage/:id", async (req, res) => {
  const userId = req.params.id; // Get the user's ID from the request parameter

  try {
    const user = await Users.findById(userId, "language");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.language);
  } catch (err) {
    res.status(500).send("Error fetching mycart data");
  }
});

app.get("/getProfile/:id", async (req, res) => {
  const userId = req.params.id; // Get the user's ID from the request parameter

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).send("Error fetching mycart data");
  }
});

app.post('/getTopics', async (req, res) => {
  const { userId, languageName } = req.body;

  try {
    // Find user by userId
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find language by languageName
    const language = user.language.find(
      lang => lang.languageName === languageName);

    if (language) {
      const topicNames = language.topics.map(topic => topic.topicName);
      res.send(topicNames);
    }
    else {
      const topicNames = []
      res.send(topicNames)
    }
    // Extract topic names

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/updateProfile/:id', upload.single('image'), async (req, res) => {
  const { Fname, Lname, username, email, bio, profession, mobile } = req.body;
  const userId=req.params.id
  const user  = await Users.findById(userId)

  const image = req.file ? req.file.filename : user.image

  try {
    const updatedUser = await Users.findByIdAndUpdate(req.params.id, {
      Fname,
      Lname,
      username,
      email,
      bio,
      profession,
      mobile,
      image
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if image is uploaded
    if (image) {
      console.log("Image uploaded successfully:", image);
    
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/userImage/:id', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user || !user.image.data) {
      return res.send({})
    }
    res.set('Content-Type', user.image.contentType);
    res.send(user.image.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/fetchTopicDetails', async (req, res) => {
  const { userId, languageName, topicName } = req.body;

  try {
    // Find the user by userId
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the language by languageName
    const language = user.language.find(lang => lang.languageName === languageName);

    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    // Find the topic by topicName
    const topic = language.topics.find(topic => topic.topicName === topicName);

    if (!topic) {
      return res.json({ complete: null }); // Topic not found
    }

    res.json({ complete: topic.complete }); // Return the 'complete' value
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get("/getLanguages", async (req, res) => {
  let languages = await Language.find();
  res.send(languages)
})

app.get('/usernames', async (req, res) => {
  try {
    const users = await Users.find({}, 'username -_id'); // Select only the username field and exclude the id
    const usernames = users.map(user => user.username);
    res.json(usernames);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/search/:key", async (req, res) => {
  let result = await Language.find({
    $or: [
      { name: { $regex: req.params.key, $options: "i" } },
    ],
  });
  res.send(result);
});

app.put("/changePswrd/:Id", async (req, res) => {
  let userId = req.params.Id
  let user = await Users.findOne({_id:userId})
  let result = await Users.updateOne(
    { _id: userId }, { $set: { password: req.body.password } }
  )
  res.send(user)
})

app.put("/deleteImage/:Id",async(req,res)=>{
  let userId = req.params.Id
  // let user = await Users.findOne({_id:userId})
  let user = await Users.findOneAndUpdate(
    { _id: userId }, { $set: { image: null } }
  )
  user.save()
  res.send(user)
})

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});
