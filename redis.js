const redis = require('redis');
const redisURL = "redis://127.0.0.1:6379";


async function main(){
    // Connection Redis
    const client = redis.createClient({url:redisURL});
    client.on("error", err=>console.log("Redis Error", err));
    await client.connect();
    console.log("Connection OK");

    await client.set('bonjour','buts5');
    const value = await client.get('bonjour');
    if (value){
        console.log("Value:", value);
    }

    // HSET & HGET
    await client.HSET("123","blog_1","title: titre 1");
    let blogvalue = await client.HGET("123","blog_1");
    if (blogvalue){
        console.log("Blog Value:", blogvalue);
    }

    let blogvalues = await client.HGETALL("123");
    for (let key in blogvalues){
        console.log(`Key: ${key} Value: ${blogvalues[key]}`);
    }

    let blog3 = {
        title: "titre 3",
        body: "contenu 3"
    }
    await client.HSET('123',
        'blog_3',
        JSON.stringify(blog3),
        'EX', 10);

    let blog3_reponse = await client.HGET('123','blog_3');
    blog3_reponse = JSON.parse(blog3_reponse);
    console.log("Blog 3:", blog3_reponse);

    await client.disconnect();
    console.log("Disconnection OK");
}
main().then(r=>console.log("MAIN OK"))