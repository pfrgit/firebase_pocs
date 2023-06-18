const functions = require('firebase-functions')


exports.billingPubSub = functions.pubsub.topic("billing").onPublish((message) =>{
    const data = message.json
    
    console.log(data)
})