# Questions that arises to developer's mind while working on the project =>

**Q1.** Which status code to be used for incomplete request data? <br />
**A1.** 422 appears to be best choice. 422 means Unprocessable Entity. Means server understands your content-type but unable to process your request.

**Q2.** What is bcrypt ??<br />
**A2.** bcrypt stands for blowfish crypt, it is hashing algorithm. It is more secure than sha256 and other sha-family hashing algorithm in case of brute force attack and rainbow attack.

**Q3.** How shamir secret share work ? <br />
**A3.** Shamir secret share works on the principle of interpolation of polynomials. It breaks  secret into N people such that each and every have equal ownership over the secret and any subset with size greater than or equal to some fixed size can reconstruct the secret. Any subset can with size less than the fixed size cannot construct the secret. [read more](https://medium.com/@apogiatzis/shamirs-secret-sharing-a-numeric-example-walkthrough-a59b288c34c4)

**Q4.** Can foreign key link to non-primary key exist?<br>
**A4.** Foreign key should always links to primary key or it should link to a key which is unique.

**Q5.** Difference between redirect and next function in express ?<br>
**A5.** 

**Q6.** Why in POST request use status code 307 - temporary and 308 - permanent, instead 301 and 302?<br>
**A6.** 

**Q7.** - Which type of authentication strategy in used in the project and why ?


**Q8.** How URL Shortner works ?

**Q9.** What is ssh-agent in ubuntu?
**A9.** 

**Q10.** Explain in cookie setting ?

```javascript
    res.set("Cache-control", "no-cache, private, no-store, must-revalidate, post-check=0,pre-check=0"); 
```

**Q11.** Can we break forEach loop ? <br />
**A11.** No, we cannot break forEach untill or unless we throw some error. callback inside the forEach will be executed synchronously for each element.The value returned by forEach loop is undefined.