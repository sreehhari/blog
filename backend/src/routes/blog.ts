import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import {jwt, sign, verify } from 'hono/jwt'
export const blogRouter = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string,
  },
}>();

blogRouter.use('/*',async(c,next)=>{
  //first we need to get the header 
  //then verify the header 
  //check the header.. if correct proceed
  //if not return err 403 

  const header = c.req.header("authorizarion") || "";
  //the header contains the bearer and the token we have to extract it
  const token = header.split("")[1]// we extract the 1st index which is the token.. 0th index is the bearer
  const response = await verify(header,c.env.JWT_SECRET);
  if (response.id){
    await next();

  }else{
    c.status(403);
    return c.json({error:"unauthorized"});
    
  }
  
  
})


blogRouter.post('/',async(c)=>{
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.blog.create({
      data:{
        title:body.title,
        content:body.content,
        authorId:
      }
    })
    return c.json({
      id:blog.id
    });
})


blogRouter.put('/',async(c)=>{
    return c.text('hello world');
})


blogRouter.get('/',async(c)=>{
    return c.text('hello world');
})

blogRouter.get('/bulk',async(c)=>{
    return c.text('hello world');
})