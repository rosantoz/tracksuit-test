# Notes

First of all, I wanted to congratulate the team that put this test together. I really enjoyed the "gotchas", the strategically placed bugs. Some of them:

- The database being empty with no tables or data;
- The endpoints not following the REST convention (for example, the create endpoint as a GET)
- The `ctx.response.body = 200` instead of `ctx.response.status = 200` in some of the endpoints
- The typos in the environment variables

Maybe I missed a few others, but it was fun to deal with them.

I tried to be as straight forward as possible according to the instructions, and cut some corners to finish it in a reasonable time. Here's a list of things I'd do with more time.

- Create custom hooks on the client side
- Better validation
- Use of controllers in place of adding logic directly to the routers

Thank you so much for your time.