const { PrismaClient } = require('@prisma/client');
const express =  require('express');
const converter = require('xml-js');
const axios = require('axios');

const prisma = new PrismaClient();

const app = express();
app.use(express.json());



app.post('/dicionario', async (req, res)=>{
    const {palavra} = req.body;
   const hasWordInDatabase =  await prisma.significados.findFirst({where:{
       palavra:palavra
   }});
   if(!hasWordInDatabase){
       const URL =  `https://api.dicionario-aberto.net/word/${palavra}`;
       const {data} = await axios.get(URL);
       const json = converter.xml2json(data[0].xml, {compact: true, spaces: 4});  
       const realJson =  JSON.parse(json);
       const [definicao, uso, _] =  realJson.entry.sense;
       const p = await prisma.significados.create({
           data:{
               palavra:palavra,
               significado: definicao.def._text,
               uso:uso.def._text
           }
       })

       return res.json(p);
   }else{
        return res.json(hasWordInDatabase)
   }
   
 });

 app.listen(3333, ()=>console.log('projeto rodando na porta 3333'))





