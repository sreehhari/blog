import { Hono } from "hono";
import { Prisma, PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import {jwt, sign, verify } from 'hono/jwt'
import { JwtAlgorithmNotImplemented } from "hono/utils/jwt/types";

interface customJWTPayload{
  id:string,
};
export const blogRouter = new Hono<{
  Bindings:{
    DATABASE_URL:string,
    JWT_SECRET:string,
  },
  Variables:{
    userId:string,
  },
}>();

blogRouter.use('/*',async(c,next)=>{
  //first we need to get the header 
  //then verify the header 
  //check the header.. if correct proceed
  //if not return err 403 

  const header = c.req.header("authorization") || "";
  //the header contains the bearer and the token we have to extract it
  // const token = header.split(" ")[1]// we extract the 1st index which is the token.. 0th index is the bearer
  try{
  const user = await verify(header,c.env.JWT_SECRET)as unknown as customJWTPayload;
  if (user){
    c.set("userId",user.id)
    await next();

  }else{
    c.status(403);
    return c.json({error:"unauthorized"});
    
  }
  
 
  }catch(error){
    c.status(403);
    return c.json({
      error:"invlaid token"
    })
  }
 
});


blogRouter.post('/',async(c)=>{
    const userId = c.get("userId");
    const body = await c.req.json();
    const prisma = new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.post.create({
      data:{
        title:body.title,
        content:body.content,
        authorId:userId,
      }
    })
    return c.json({
      id:blog.id
    });
})


blogRouter.put('/',async(c)=>{
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,

  }).$extends(withAccelerate());

  const blog = await prisma.post.update({
    where:{
      id:body.id
    },
    data:{
      title:body.title,
      content:body.content,
      
    }
  });
    return c.json({
      id:blog.id
    });
})


blogRouter.get('/bulk',async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.post.findMany();
  return c.json({
    blog
  })
});

blogRouter.get('/:id',async(c)=>{
  // const body = await c.req.json();
  const id =  c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate());
 try{

  const blog = await prisma.post.findFirst({
    where:{
      id:id,
    }
  })
    return c.json({
      blog
    });
 }catch(error){
  c.status(411);
  return c.json({
    message:"error while fetching the blog"
  })
 }
})