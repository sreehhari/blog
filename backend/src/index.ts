import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import {jwt, sign, verify } from 'hono/jwt';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
//pass database url type as string for type error prevention
const app = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string,
  },
}>();

//defining routes in differenet fies 
app.route("/api/v1/user",userRouter);
app.route("/api/v1/blog",blogRouter);
//middleware to check the token before allowing the user into any route at /api/v1/blog

app.get('/', (c) => {
  return c.text('Hello Hono!')
})



// app.post('/api/v1/blog',async(c)=>{

// });

// app.put('/api/v1/blog',async(c)=>{

// });

// app.get('/api/v1/blog/:id',async(c)=>{

// })



export default app
