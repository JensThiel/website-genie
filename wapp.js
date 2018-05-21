const Wappalyzer = require('wappalyzer');
const options = {
  debug: false,
  delay: 500,
  maxDepth: 3,
  maxUrls: 10,
  maxWait: 5000,
  recursive: true,
  userAgent: 'Wappalyzer',
};


module.exports = {
  getWapp:function(url){
    const wapp = new Wappalyzer(url, options);
    return new Promise((resolve,reject)=>{
      wapp.analyze()
      .then(json => {
        resolve(json)
      })
      .catch(error => {
        reject(error)
    });
    })
  }
}