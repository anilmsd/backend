const User=require('./../model/user');
const bcrypt=require('bcrypt');

// exports.createUser = async (req, res) => {
  
//     try {
//       const { name,   email,password, role,} = req.body;
  
//       const salt = await bcrypt.genSalt();
//       const passwordHash = await bcrypt.hash(password, salt);
//       const newUser = new User({
//         name,     
//         email,
//         password: passwordHash,
//         role
//       });
//       const savedUser = await newUser.save();
//       res.status(201).json(savedUser);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };


exports.createUser = async (req, res) => {
  try {
      const { name, email, password, roles } = req.body;
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = new User({
          name,
          email,
          password: passwordHash,
          roles
      });
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email }).select('+password');
      if (!user) return res.status(400).json({ msg: "User does not exist. " });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });
    //   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    //   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // })
    
      // user.password=undefined;
      res.status(200).json({user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.restrictTo = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const role = req.params.role;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.roles.includes(role)) {
            res.status(201).json({msd:"This user has access for this"});
            next();
        } else {
            return res.status(403).json({ msg: 'Access Denied' });
        }

    } catch (err) {
        res.status(500).json({ msg: 'Internal Server Error', error: err.message });
    }
};
