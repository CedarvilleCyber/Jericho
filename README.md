# Jericho

Jericho is a Cedarville University senior design project dedicated to creating 
cyber-physical training scenarios for high school and college students. 

One of our primary goals is accessibility. To achieve this goal, we utilized
an open-source infrastructure-as-code tool called Ludus to build the networks
for our scenarios. Our hope is that you can use Ludus to build your own scenario
networks if you so desire. To learn more about the Ludus project, navigate to
https://ludus.cloud and read their documentation.

To deploy a Jericho scenario, download the scenario's configuration file
onto your server and use Ludus to instantiate it.

1. Install "bun"
3. in the "website" directory, run "bun install"
4. Copy the .env file into "website/.env"
5. cd prisma
6. run "bun prisma generate"
7. cd .. (the "website" directory)
8. run "bun dev"
9. Check nginx for setting up and running the nginx stuff
