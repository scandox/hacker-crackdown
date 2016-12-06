# Hacker Crackdown: Open Annotated Edition

## What is this?

This is a site that generates a readable, paginated edition of _The Hacker Crackdown_ by Bruce Sterling and allows users to anonymously make annotations on the text that can be read by other users.

If you want to deploy your own version of this site you can do so as follows:

*  git clone https://github.com/scandox/hacker-crackdown
*  cd hacker-crackdown
*  npm install
*  gulp
*  cp config/config-sample.json config/config.json 
*  edit config.json to provide database connection parameters
*  edit config.json to provide a servername and a secret (big random string) for generating JWTs. (These tokens allow someone to claim a username).
*  npm start
*  Visit http://localhost:3000

The site does rely on a Postgres installation. While it does use the Sequelize ORM I've used the JSON data types that are custom to Postgres.

## Licence

The MIT License

Copyright (c) 2016, scandox

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
