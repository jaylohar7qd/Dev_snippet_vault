const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const requireAuth = require('../middleware');
const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || process.env.JWT_secret;

router.post('/signup',async(req,res)=>{
    const {name , email , password} = req.body || {};
    if(
        typeof name !=='string' || !name.trim()||
        typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== 'string'
    ){
        return res.status(400).json({error:'valid name , email , password are required'})
    }
   if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and at most 72 bytes' });
  }
 
try {
  const passwordHash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from('users')
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash
    })
    .select('id, name, email, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }

    return res.status(500).json({ error: 'Could not create account' });
  }

  return res.status(201).json({ message: 'Account created', user: data });
} catch (error) {
  return res.status(500).json({ error: 'Signup failed' });
}
})

router.post('/login', async(req,res)=>{
    const{email,password} = req.body || {};

    if(
        typeof email !== 'string' || !email.trim() ||
        typeof password !== 'string'|| !password||
        Buffer.byteLength(password,'utf8') > 72
    ){
        return res.status(400).json({error: 'Email and password are required ; password must not exceed 72 bytes'});
    }

    if (!jwtSecret) {
        return res.status(500).json({ error: 'Server authentication is not configured' });
    }

    try{
        const{data:user,error} = await supabase.from('users').select('id,name,email,password').eq('email',email.trim().toLowerCase()).maybeSingle();
        if(error){
            return res.status(500).json({error:'Login failed'});
        }
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { sub: user.id },
            jwtSecret,
            { algorithm: 'HS256', expiresIn: '1h' }
        );

        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch(error){
        return res.status(500).json({error: 'Login failed'});
    }
})

router.get('/me',requireAuth, async(req,res)=>{
  try{
    const{data:user,error}=await supabase.from('users').select('id,name,email,created_at').eq('id',req.userId).maybeSingle();

   
    if(error){
        return res.status(500).json({error:'Could not fetch user'});
    }
    if(!user){
      return res.status(401).json({error:'User no longer found'});
    }
    return res.json({user});
  }
  catch(error){
     return res.status(500).json({error:'could not fetch user'});
  }
})

module.exports = router;


