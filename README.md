## Steps to run the Blog server

**Step 1:**
**Installing dependencies**

-   In your terminal run `npm install` to install depencies

**Step 2:**
**creating database and entities**

-   In your terminal run `npx sequelize db:create` to create database
-   run `npx sequelize db:migrate`to create all the

**Step 3:**
**Run the server**

-   In your terminal run `npm run dev` to spin-up the server

**Step 4:**
**JWT Encode and Decode**

-   Create a blogger using the **/bloggers/** route
-   Copy the userId of the blogger you created
-   In your terminal run `node token --encode  --data or -D [userId]` and a **jwtToken** will be logged in the termial
-   You can test to decode the **jwtToken** by running `node token --decode  --data or -D [token]` back to userId data ro verify
-   Use the **jwtToken** as Access Token in **Authorization Bear [token]** in the request header or use Postman Authorization with type Bear Token and paste **jwtToken**. The token must be used for all request or route, for test purpose.
