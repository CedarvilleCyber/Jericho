<?php
    session_start();
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
            $date = (new DateTime())->modify('-1 month'); // set to previous month

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