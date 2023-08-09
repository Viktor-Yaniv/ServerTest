import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import fs from'fs'
import path from 'path'


const jwt_key = process.env.JWT_KEY;


//הצגת כל הפוסטים
export const getPosts = async (req, res) => {
  try {
    const { search, category, gender, location, type, isEducated, isImmune, isCastrated, minAge, maxAge, orderBy } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (gender) {
      query.gender = gender;
    }

    if (location) {
      query.location = location;
    }

    if (type) {
      query.type = type;
    }

    if (isEducated) {
      query.isEducated = isEducated;
    }

    if (isImmune) {
      query.isImmune = isImmune;
    }

    if (isCastrated) {
      query.isCastrated = isCastrated;
    }

    if (minAge && maxAge) {
      const minAgeNumber = parseInt(minAge);
      const maxAgeNumber = parseInt(maxAge);

      if (minAgeNumber > maxAgeNumber) {
        return res.status(400).json({ message: "Invalid age range. Minimum age should be less than or equal to maximum age." });
      }

      // Add age range condition to the query
      query.age = {
        $gte: minAgeNumber,
        $lte: maxAgeNumber
      };
    }

    let posts = await Post.find(query);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  
  

//הצגת פוסט יחיד
// Server controller
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id; // Assuming the post ID is passed as a route parameter

    const post = await Post.findById(postId);
    const user = await User.findById(post.author);
    const { username, image } = user; // Extract username and image from the user object

    const postWithUser = {
      ...post.toObject(),
      author: {
        id: post.author,
        username: username,
        image: image
      }
    };

    res.json(postWithUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




//העלאת פוסט
export const savePost = async (req, res) => {
    try 
    {
        //const image  = req.file.path.replace('uploads\\', "/");
        const token = req.body.userId;
        const decoded = jwt.verify(token, jwt_key);
        const userId = decoded.id;
        
    
        let post = new Post({
            title: req.body.title,
            category: req.body.category,
            gender: req.body.gender,
            location: req.body.location,
            type: req.body.type,
            age: req.body.age,
            description: req.body.description,
            name: req.body.name,
            author: userId,
            
        });

        if(req.files) {
          let path = ''
          req.files.forEach(function(files, index, arr) {
            path = path + files.path + ','
          })
            path = path.substring(0, path.lastIndexOf(","))
            post.image = path;
          }
          if(post.image == ''){
            post.image = '/defaultImage.png'
          }
        
        if(req.body.isImmune)
        {
          post.isImmune = req.body.isImmune;
        }
        if(req.body.isEducated)
        {
          post.isEducated = req.body.isEducated;
        }
        if(req.body.isCastrated)
        {
          post.isCastrated = req.body.isCastrated;
        }
      
        console.log(post)
        const insertedpost = await post.save();
        res.status(201).json(insertedpost);
    } 
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}


export const updatePost = async (req, res) => {
    try {
        let image;
        if (req.file) {
            image = req.file.path.replace('uploads\\', "/");
          }
        const token = req.body.userId;
        const postId = req.params.id;
        
        console.log("image : ",image)
        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const idUserPost = post.author;
        
        // Verify the token and get the user ID
        const decoded = jwt.verify(token, jwt_key);
        const userId = decoded.id;
        console.log("userId : " + userId)
        console.log("idUserPost : " + idUserPost)

        if (idUserPost && idUserPost == userId) {
       

            // Set the update object to all fields except the userId field
            const updateData = {
                title: req.body.title,
                category: req.body.category,
                gender: req.body.gender,
                location: req.body.location,
                type: req.body.type,
                age: req.body.age,
                description: req.body.description,
                name: req.body.name,
                author: userId,
                image: image

             };
            if(!image)
            {
                delete updateData.image;
            }
            delete updateData.author;

            // Update the post
            const updatedPost = await Post.findByIdAndUpdate(postId, { $set: updateData });
            res.status(200).json({ post: updatedPost });
        } else {
            res.status(403).json({ message: 'You are not authorized to perform this action' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

 


export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const token = req.headers.authorization; // Retrieve the entire Authorization header
    const decoded = jwt.verify(token, jwt_key);

    const post = await Post.findById(postId);
    if (post.author.toString() == decoded.id) {
      await Post.findByIdAndDelete(postId);
      return res.status(200).json({ message: 'Post deleted' });
    }
    else {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: 'You are not authorized to perform this action' });
  }
};


export const somePosts = async (req, res) => {
  try {
    const posts = await Post.find().limit(6); // Retrieve only the top 5 posts
    
    return res.json(posts);
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
};


  export const getPostImage = async (req, res) => {
    const { filename } = req.params;
  const imagePath = path.join(__dirname, 'public', 'images', filename);

  // Check if the image file exists
  if (fs.existsSync(imagePath)) {
    // Read the file from disk and send it to the client
    const fileStream = fs.createReadStream(imagePath);
    fileStream.pipe(res);
  } else {
    // If the file does not exist, send a 404 error
    res.sendStatus(404);
  }
  }


