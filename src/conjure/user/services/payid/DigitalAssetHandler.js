// import { PayIdClient, IlpClient, PaymentRequest } from 'xpring-js'
import bigInt from "big-integer"

export default class DigitalAssetHandler
{
    async initialise()
    {
        await this.initXpring()
    }

    async initXpring()
    {
        const { PayIdClient, IlpClient, PaymentRequest } = window.XpringJS
    
        const payIdClient = new PayIdClient()
        const payId = 'hexafield$xpring.money'
        const allAddresses = await payIdClient.allAddressesForPayId(payId)
        console.log(allAddresses)
        // const balance = await this.ilpClient.getBalance('hexafield', 'Nzg4YmM2OTQtMmYxNS00YjlkLWEzMWMtZGNiODdhYjQ0YjQz')
        // console.log(
        //   'Net balance was ' +
        //     balance.netBalance +
        //     ' with asset scale ' +
        //     balance.assetScale,
        // )
    }

    async makePayment(amount, to, from)
    {
        // let paymentRequest = new PaymentRequest({
        //     amount: bigInt.one,
        //     destinationPaymentPointer: destination,
        //     senderAccountId: sender
        // })
        // console.log(this.ilpClient.sendPayment(paymentRequest))
        return true
    }
}