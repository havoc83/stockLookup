
// Using node 18.1.0
const http = require('http')
const fs = require('fs')

const hostname = '127.0.0.1'

const port = 3000


const getData = (ticker, res) => { fetch(`https://finance.yahoo.com/quote/${ticker.toUpperCase()}`)
  .then((resp) => {
    return resp.text().then((text) => {
      // This is a bit unnecessary in reality I would use a library to handle this parsing but I wanted to 
      // keep this as minimalistic as possible so that there would not be a ton of libraries to install
      let values = ["PREV_CLOSE", "OPEN", "BID", "ASK", "DAYS_RANGE", "FIFTY_TWO_WK_RANGE", "TD_VOLUME",
      "AVERAGE_VOLUME_3MONTH", "MARKET_CAP", "BETA_5Y", "PE_RATIO", "EPS_RATIO", "EARNINGS_DATE",
      "DIVIDEND_AND_YIELD", "EX_DIVIDEND_DATE", "ONE_YEAR_TARGET_PRICE"]
      results = {}
      for(const v of values){
        let rexp = new RegExp(`data-test="${v}-value">(.*?)<\/td>`)
        let found = text.match(rexp)
        if(found === null) {
          continue
        }
        if(found[1].indexOf('>') !== -1) {
          results[v] = found[1].substring(found[1].indexOf('>') + 1, found[1].indexOf('<', 1))
        } else {
          results[v] = found[1]
        }
      }
      results["SYMBOL"] = ticker.toUpperCase()
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      let data = fs.readFileSync('./index.html')
      for (const val in results){
        data = data.toString().replace(`{ ${val} }`, results[val])
      }
      res.write(data)
      res.end()
      
    })
  })
  .catch((err) => {
    console.log(err)
  })
}

const server = http.createServer((req, res) => {
  if(req.url !== '/'){
    getData(req.url.substr(1), res)
  } else {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    let data = fs.readFileSync('./index.html')
    res.write(data)
    res.end()
  }
  
  })


server.listen(port, hostname, () => {
    console.log(`Server runnning at http://${hostname}:${port}`)
})
