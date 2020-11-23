# Questions that arises to developer's mind while working on the project =>

**Q1.** Which status code to be used for incomplete request data? <br />
**A1.** 422 appears to be best choice. 422 means Unprocessable Entity. Means server understands your content-type but unable to process your request.

**Q2.** What is bcrypt ??<br />
**A2.** bcrypt stands for blowfish crypt, it is hashing algorithm. It is more secure than sha256 and other sha-family hashing algorithm in case of brute force attack and rainbow attack.

**Q3.** How shamir secret share work ? <br />
**A3.** Shamir secret share works on the principle of interpolation of polynomials. It breaks  secret into N people such that each and every have equal ownership over the secret and any subset with size greater than or equal to some fixed size can reconstruct the secret. Any subset can with size less than the fixed size cannot construct the secret. [read more](https://medium.com/@apogiatzis/shamirs-secret-sharing-a-numeric-example-walkthrough-a59b288c34c4)