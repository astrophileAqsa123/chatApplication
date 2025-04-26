import mongoose from "mongoose"
export const connectdB=async()=>{
    try{
        const conn =await mongoose.connect(process.env.MONGO_URL);
        console.log(`Mongodb connected successfullt ${conn.connection.host}`)
    }
    catch(e){
        console.log(e);
    }
}