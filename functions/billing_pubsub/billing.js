const functions = require('firebase-functions')
const {google} = require('googleapis')
const {GoogleAuth} = require('google-auth-library')

const billing = google.cloudbilling('v1').projects
const PROJECT_ID = process.env.GCLOUD_PROJECT
const PROJECT_NAME = `projects/${PROJECT_ID}`

exports.getBillingInfo = functions.https.onRequest( async (req, res) =>{

    setCredentials()

    const billinginfo = await billing.getBillingInfo({name: PROJECT_NAME})
    console.log(billinginfo)
    res.send("all done")
})

exports.billingPubSub = functions.pubsub.topic("billing").onPublish((message) =>{
    const data = message.json
    const spentSoFar = data.costAmount
    const disableBillingAmount = 5000;

    if(spentSoFar > disableBillingAmount){
        disableBilling()
    }
    console.log(data)
})


async function disableBilling(){
    setCredentials()
    if(PROJECT_NAME){
        const billinginfo = await billing.getBillingInfo({name: PROJECT_NAME})
        if(billinginfo.data.billingEnabled){
            const result = await billing.updateBillingInfo({
                name: PROJECT_NAME,
                requestBody: {billingAccountName: ''}
            })
            console.log("Billing disabled.")
            console.log(JSON.stringify(result))
        } else{
            console.log("Billing already disabled.")
        }
    }
    

}

function setCredentials(){
    const client = new GoogleAuth({
        scopes : [
            'https://www.googleapis.com/auth/cloud-billing',
            'https://www.googleapis.com/auth/cloud-platform'
        ]
    })

    google.options({
        auth: client
    })
}