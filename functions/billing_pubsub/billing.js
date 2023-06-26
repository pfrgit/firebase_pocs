const functions = require('firebase-functions')
const {google} = require('googleapis')
const {GoogleAuth} = require('google-auth-library')

const {db } = require("../common/admin");
require('dotenv').config()


const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// const client = require('twilio')("AC1197a527c9dfa62829f7f6dac1d5c7e2","087419277cd300b201cd397ab4f7d406");

const billing = google.cloudbilling('v1').projects
const PROJECT_ID = process.env.GCLOUD_PROJECT
const PROJECT_NAME = `projects/${PROJECT_ID}`

exports.billingMonitoringServiceAPI = functions.https.onRequest( async (req, res) =>{

    setCredentials()

    const billinginfo = await billing.getBillingInfo({name: PROJECT_NAME})
    console.log(billinginfo)
    res.send("all done")

})

exports.billingPubSub = functions.pubsub.topic("billing").onPublish(async (message) =>{
    const data = message.json
    const spentSoFar = data.costAmount

    const alert_value_doc = await db.doc("alerts/alert_values").get()
    const alert_values = alert_value_doc.data()
    console.log(alert_values.alarmAlertValue, alert_values.sosAlertValue)
    if(spentSoFar > alert_values.alarmAlertValue){
        //emergency call
        const alert_contacts_doc = await db.doc("alerts/alertContactNumbers").get()
        const alert_contacts = alert_contacts_doc.data()
        client.calls
            .create({
            twiml: `<Response><Say>Hello. You have almost reached the ${alert_values.sosAlertValue} rupees SOS alert amount. You have spent ${spentSoFar} rupees till now.</Say></Response>`,
            to: alert_contacts.PhoneNumber1,
            from: '+15416314424'
            })
            .then(call => console.log(call.sid));
        
        console.log(alert_contacts.PhoneNumber1)
    }else if(spentSoFar > alert_values.sosAlertValue){
        disableBilling()
    }
    console.log(data)

    return null
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