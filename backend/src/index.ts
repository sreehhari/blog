import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import {jwt, sign } from 'hono/jwt'
//pass database url type as string for type error prevention
const app = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string,
  },
}>()


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/v1/signup',async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  
  }).$extends(withAccelerate());

  //getting the body
  const body = await c.req.json();

  const isUnique = await prisma.user.findUnique({
    where:{
      email:body.email,
    }
  });
  if(isUnique){
     c.status(403);
    return c.json({error:"user already exists"})
  }
  
  const user =await prisma.user.create({
    data:{
      email:body.email,
      password:body.password,
    },
  });

  const token = await sign({
    id:user.id,
    },c.env.JWT_SECRET);
  return c.json({
    jwt:token
  })

});

app.post('/api/v1/signin',async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,

  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where:{
      email:body.email,
    }
  });


  if(!user){
    c.status(403)
    return c.json({
      error:"user not found"
    });
  }

  const jwt = await sign({
    id:user.id,
  },c.env.JWT_SECRET);
  return c.json({
    jwt
  })

});

// app.post('/api/v1/blog',async(c)=>{

// });

// app.put('/api/v1/blog',async(c)=>{

// });

// app.get('/api/v1/blog/:id',async(c)=>{

// })



export default app
