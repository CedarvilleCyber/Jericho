<?php
    session_start();

    $date = (new DateTime())->modify('-1 month'); // set to previous month
    $employees = ["Michael Rembrandt", "Redd Harlan", "Lauren Towner", 
                  "Carla Winslow", "Hugh Farnham", "Anthony Smith", 
                  "Erik Williams", "Clare Sidney", "Emma Chavez",
                  "Annie Gregory", "Suzanne Bender", "Kevin Mitnick"];
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Employee of the Month</title>
        <?php include 'topnav.php'; ?> 
        <link rel="stylesheet" href="./css/month.css">
    </head>
    <p>Here, we honor our greatest employees.</p>
    <div class="grid-container">
        <?php
            for ($i = 0; $i < 12; $i++) {
                echo <<<HTML1
                    <div class="box">
                    <!-- figure out how to size the image better -->
                    <img src="./images/m-rembrandt.jpg" width="200">
                    <p>Michael Rembrandt</p>
                    HTML1;

                    // add an array of employee names and print the employee names 
                    // and stock images similarly to what you're doing below.

                    printf("<p>%s</p>\n</div>", $date->format('F Y'));

                    $date->modify('-1 month');
            }
        ?>
    </div>
</html>