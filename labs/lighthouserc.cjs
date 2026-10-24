// Optional example, run with an explicitly chosen Lighthouse CI installation.
// Start `npm run labs:start` separately; no upload service is configured.
module.exports={ci:{collect:{url:['http://127.0.0.1:4173/lab?variant=improved&case=loading'],numberOfRuns:3},assert:{assertions:{'largest-contentful-paint':['warn',{maxNumericValue:2500}],'cumulative-layout-shift':['warn',{maxNumericValue:0.1}],'total-blocking-time':['warn',{maxNumericValue:200}]}}}};
