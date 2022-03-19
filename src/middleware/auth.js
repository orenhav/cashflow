const jwt = require('jsonwebtoken')
const {User} = require('../modules/users')

const auth  =async (req, res, next)=>{
   try {
       const token = req.header('Authorization').replace('Bearer ', '')
       const decode = await jwt.verify(token,'gthisismysecret')
      const user = await User.findOne({_id: decode._id, 'tokens.token': token})
      
      if(!user){
          throw new Error()
      }
      req.user = user
      req.token = token
      next()
   } catch (error) {
       res.status(401).send(error.message  + "Please authenticate")
   }
  
   
}

module.exports = auth